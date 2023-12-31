const $$ = (e) => document.querySelector(e);

const acc = $$('#acc');
const pass = $$('#pass');
const btn = $$('#btn');
const welcome = $$('#welcome');
const name_ = $$('#name');

let email, password;

acc.addEventListener('input', (e) => {
  email = e.target.value;
});

pass.addEventListener('input', (e) => {
  password = e.target.value;
});

const signin = async (body) => {
  try {
    const res = await fetch('http://localhost:3001/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    }).then((res) => {
      if (res.status !== 201) throw new Error('登入失敗');
      return res.json();
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};

const setSession = (o) => {
  Object.entries(o).forEach(([key, val]) => {
    sessionStorage.setItem(key, val);
  });
};

btn.addEventListener('click', async () => {
  const json = JSON.stringify({ email, password });
  const { id, name, access_token } = await signin(json);

  if (access_token) setSession({ access_token, id });

  if (name) {
    welcome.style.display = 'block';
    name_.innerText = name;
  }
});

const socket = io('ws://localhost:3002/', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZTcxYjM1MWJmYTUyMDU1NzE0ZjA5MSIsIm5hbWUiOiLosazmjpLlr7blr7YiLCJpYXQiOjE2OTMxOTE5NTEsImV4cCI6MTY5MzM2NDc1MX0.axOoxLvoK0Ph6Vs1Y6cJG1IIvcWSS3jJreWJmvYIE2o',
  },
});
socket.on('connect', function () {
  console.log('Connected');

  socket.emit('send_message', 'asd');
  socket.on('receive_message', (e) => {
    console.log(e);
  });
});
