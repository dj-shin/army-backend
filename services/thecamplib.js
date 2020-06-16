const thecamp = require('the-camp-lib');
const axios = require('axios').default;
const qs = require('querystring');

async function login(id, password) {
  const options = {
    url: thecamp.buildRequestUrl('login/loginA.do'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      state: 'email-login',
      autoLoginYn: 'N',
      userId: id,
      userPwd: password,
    }),
  };
  let result = null;

  const response = await axios(options);
  const body = response.data;

  thecamp.addLog('login', `${response.status} ${response.statusText}`);

  if (response.status === 200 && body.resultCd !== '0000') {
    throw new Error(body.resultMsg || '알 수 없는 에러.');
  }

  if (!response.headers['set-cookie']) {
    throw new Error('쿠키를 찾을 수 없습니다.');
  }

  result = thecamp.extractCookies(response.headers['set-cookie']);

  if (!response || !result) {
    throw new Error('응답 값이 없습니다.');
  }

  return result;
}

async function addSoldier(cookies, soldier) {
  const options = {
    url: thecamp.buildRequestUrl('missSoldier/insertDirectMissSoldierA.do'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `${cookies.iuid}; ${cookies.token}`,
    },
    data: qs.stringify({
      missSoldierClassCdNm: soldier.getMissSoldierClassCdNm(),
      grpCdNm: soldier.getGrpCdNm(),
      missSoldierClassCd: soldier.getMissSoldierClassCd(),
      grpCd: soldier.getGrpCd(),
      name: soldier.getName(),
      birth: soldier.getBirth(),
      enterDate: soldier.getEnterDate(),
    }),
  };

  const response = await axios(options);
  if (!response) {
    throw new Error('응답 값이 없습니다.');
  }

  const body = response.data;

  thecamp.addLog('addSoldier', `${response.status} ${response.statusText}`);

  if (response.status === 200 && body.resultCd !== '0000' && body.resultCd !== 'E001') {
    throw new Error(body.resultMsg || '알 수 없는 에러.');
  }

  return true;
}

async function fetchSoldiers(cookies, soldier) {
  const options = {
    url: thecamp.buildRequestUrl('main/cafeCreateCheckA.do'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `${cookies.iuid}; ${cookies.token}`,
    },
    data: qs.stringify({
      name: soldier.getName(),
      birth: soldier.getBirth(),
      enterDate: soldier.getEnterDate(),
    }),
  };

  const response = await axios(options);
  if (!response) {
    throw new Error('응답 값이 없습니다.');
  }

  const body = response.data;
  thecamp.addLog('fetchSoldier', `${response.status} ${response.statusText}`);

  if (response.status === 200 && body.resultCd !== '9999') {
    throw new Error(body.resultMsg || '알 수 없는 에러.');
  }

  const result = body.listResult.map((fetchedSoldierInfo) => {
    const { traineeMgrSeq } = fetchedSoldierInfo;
    const clonedSoldier = soldier.clone();
    clonedSoldier.setTraineeMgrSeq(traineeMgrSeq);
    return clonedSoldier;
  });

  if (!result || result.length === 0) {
    throw new Error('해당하는 군인을 찾을 수 없습니다.');
  }

  return result;
}

async function sendMessage(cookies, trainee, message) {
  if (trainee.getMissSoldierClassCd() !== thecamp.SoldierClass['예비군인/훈련병']) {
    throw new Error('예비군인/훈련병에게만 편지를 보낼 수 있습니다.');
  }

  const options = {
    url: thecamp.buildRequestUrl('consolLetter/insertConsolLetterA.do?'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `${cookies.iuid}; ${cookies.token}`,
    },
    data: qs.stringify({
      traineeMgrSeq: message.getTraineeMgrSeq(),
      sympathyLetterContent: message.getSympathyLetterContent(),
      sympathyLetterSubject: message.getSympathyLetterSubject(),
      boardDiv: 'sympathyLetter',
      tempSaveYn: 'N',
    }),
  };

  const response = await axios(options);
  if (!response) {
    throw new Error('응답 값이 없습니다.');
  }
  const body = response.data;

  thecamp.addLog('sendMessage', `${response.status} ${response.statusText}`);

  if (response.status === 200 && body.resultCd !== '0000') {
    throw new Error(body.resultMsg || '알 수 없는 에러.');
  }

  return response;
}

module.exports = { login, addSoldier, fetchSoldiers, sendMessage };
