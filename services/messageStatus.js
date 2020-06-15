const requestPromise = require('request-promise');
const thecamp = require('the-camp-lib');

async function messageStatus(cookies, trainee) {
  const options = {
    uri: thecamp.buildRequestUrl('consolLetter/selectConsolLetterA.do?'),
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `${cookies.iuid}; ${cookies.token}`,
    },
    form: {
      traineeMgrSeq: trainee.getTraineeMgrSeq(),
      keepSearchConditionUrlKey: 'consolLetter',
      _url: 'https://thecamp.or.kr/consolLetter/viewConsolLetterMain.do', 
      tempSaveYn: 'N',
    },
  };

  const response = await requestPromise(options, (err, res, body) => {
    if (err) {
      throw new Error(err);
    }

    thecamp.addLog('messageStatus', `${res.statusCode} ${res.statusMessage}`);

    if (res.statusCode === 200 && body.resultCd !== '0000') {
      throw new Error(body.resultMsg || '알 수 없는 에러.');
    }
  });

  if (!response) {
    throw new Error('응답 값이 없습니다.');
  }

  return response;
}

async function sendMessage(cookies, trainee, message) {
  if (trainee.getMissSoldierClassCd() !== thecamp.SoldierClass['예비군인/훈련병']) {
    throw new Error('예비군인/훈련병에게만 편지를 보낼 수 있습니다.');
  }

  const options = {
    uri: thecamp.buildRequestUrl('consolLetter/insertConsolLetterA.do?'),
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `${cookies.iuid}; ${cookies.token}`,
    },
    form: {
      traineeMgrSeq: message.getTraineeMgrSeq(),
      sympathyLetterContent: message.getSympathyLetterContent(),
      sympathyLetterSubject: message.getSympathyLetterSubject(),
      boardDiv: 'sympathyLetter',
      tempSaveYn: 'N',
    },
  };

  const response = await requestPromise(options, (err, res, body) => {
    if (err) {
      throw new Error(err);
    }

    thecamp.addLog('sendMessage', `${res.statusCode} ${res.statusMessage}`);

    if (res.statusCode === 200 && body.resultCd !== '0000') {
      throw new Error(body.resultMsg || '알 수 없는 에러.');
    }
  });

  if (!response) {
    throw new Error('응답 값이 없습니다.');
  }

  return response;
}

module.exports = { messageStatus, sendMessage };
