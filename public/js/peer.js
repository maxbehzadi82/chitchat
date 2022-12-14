const socket = io();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
// const backBtn = document.querySelector('.header__back');
myVideo.muted = true;

// backBtn.addEventListener('click', () => {
//   document.querySelector('.main__left').style.display = 'flex';
//   document.querySelector('.main__left').style.flex = '1';
//   document.querySelector('.header__back').style.display = 'none';
// });

// const user = prompt('Enter your name');

var peer = new Peer();

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', (call, u) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId, userName) => {
      // console.log(2, userName);
      // user = userName;
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  console.log(userId);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on('open', (id) => {
  // user = document.getElementById('myUsername').innerHTML;
  // console.log(3, user);
  socket.emit('join-room', ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
    videoGrid.append(video);
  });
};

const inviteButton = document.querySelector('#inviteButton');
const muteButton = document.querySelector('#muteButton');
const stopVideo = document.querySelector('#stopVideo');
muteButton.addEventListener('click', () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle('background__red');
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle('background__red');
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener('click', () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle('background__red');
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle('background__red');
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener('click', (e) => {
  prompt(
    'Copy this link and send it to people you want to meet with',
    window.location.href
  );
});
