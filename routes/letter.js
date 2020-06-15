const express = require('express');
const router = express.Router();

const Letter = require('../models/letter');

router.get('/', function(req, res, next) {
  Letter.findAll()
    .then((letters) => {
      res.send(letters)
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
});

router.get('/:letterId', (req, res) => {
  Letter.findOneById(req.params.letterId)
    .then((letter) => {
      if (!letter) return res.status(404).send({ err: 'Letter not found' });
      res.send(letter);
    })
    .catch(err => res.status(500).send(err));
});

router.put('/:letterId', (req, res) => {
  Letter.updateById(req.params.letterId, req.body)
    .then(letter => res.send(letter))
    .catch(err => res.status(500).send(err));
});

router.delete('/:letterId', (req, res) => {
  Letter.deleteById(req.params.letterId)
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).send(err));
});

router.post('/', (req, res) => {
  Letter.create(req.body)
    .then(letter => res.send(letter))
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
});

module.exports = router;
