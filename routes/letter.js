const dotenv = require('dotenv');
const express = require('express');
const router = express.Router();

const Letter = require('../models/letter');
const { messageStatus, sendMessage } = require('../services/messageStatus');

const thecamp = require('the-camp-lib');

async function sendCamp(title, content) {
  dotenv.config();

  if (process.env.SKIP_CAMP) {
    console.log(`SKIP_CAMP:title ${title}`);
    console.log(`SKIP_CAMP:content ${content}`);
    return true;
  }

  const id = process.env.CAMP_ID;
  const password = process.env.CAMP_PW;

  const name = process.env.RECRUIT_NAME;
  const birth = process.env.RECRUIT_BIRTH;
  const enterDate = process.env.RECRUIT_ENTER;
  const className = '예비군인/훈련병';
  const groupName = '육군';
  const unitName = '육군훈련소';

  const soldier = new thecamp.Soldier(
    name,
    birth,
    enterDate,
    className,
    groupName,
    unitName,
    thecamp.SoldierRelationship.FAN,
  );

  const cookies = await thecamp.login(id, password);
  await thecamp.addSoldier(cookies, soldier);
  const [trainee] = await thecamp.fetchSoldiers(cookies, soldier);

  const message = new thecamp.Message(title, content, trainee);
  return sendMessage(cookies, trainee, message);
};

async function queryStatus() {
  dotenv.config();

  const id = process.env.CAMP_ID;
  const password = process.env.CAMP_PW;

  const name = process.env.RECRUIT_NAME;
  const birth = process.env.RECRUIT_BIRTH;
  const enterDate = process.env.RECRUIT_ENTER;
  const className = '예비군인/훈련병';
  const groupName = '육군';
  const unitName = '육군훈련소';

  const soldier = new thecamp.Soldier(
    name,
    birth,
    enterDate,
    className,
    groupName,
    unitName,
    thecamp.SoldierRelationship.FAN,
  );

  const cookies = await thecamp.login(id, password);
  await thecamp.addSoldier(cookies, soldier);
  const [trainee] = await thecamp.fetchSoldiers(cookies, soldier);

  return messageStatus(cookies, trainee);
}

router.get('/', function(req, res, next) {
  Letter.findAll().select('-content').sort('-createdAt')
    .then((letters) => {
      queryStatus()
        .then(result => {
          console.log(result);
          res.send(letters);
        })
        .catch(console.error);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
});

router.get('/:letterId', (req, res) => {
  Letter.findOneById(req.params.letterId)
    .then((letter) => {
      if (!letter) {
        return res.status(404).send({ err: 'Letter not found' });
      }
      if (letter.isPublic !== "true") {
        return res.status(401).send({ err: 'Letter is not public' });
      }
      res.send(letter);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
});

async function onPost(req, res) {
  const contentLimit = 1500;
  let result;

  if (req.body.content.length > contentLimit) {
    const messages = [];
    for (let i = 0; i < Math.floor(req.body.content.length / contentLimit); i++) {
      messages.push(sendCamp(
        `${req.body.title} (${i + 1}) - ${req.body.sender}`,
        req.body.content.slice(i * contentLimit, (i + 1) * contentLimit),
      ));
    }
    const results = await Promise.all(messages);
    result = results.reduce((acc, e) => acc && e, true);
  } else {
    result = await sendCamp(req.body.title + ' - ' + req.body.sender, req.body.content)
      .catch(err => {
        console.error('Error in sendCamp: ', err);
        return res.status(500).send(err);
      });
    console.log('sendCamp:', result);
  }

  if (result) {
    req.body.completed = true;
  }
  const letter = await Letter.create(req.body);
  return res.send(letter);
}

router.post('/', (req, res) => {
  onPost(req, res)
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
});

module.exports = router;
