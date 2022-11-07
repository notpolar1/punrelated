import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification, signInWithPhoneNumber, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import intlTelInput from 'intl-tel-input';

// Set up phone input
const phoneInput = document.getElementById('phone-input');
const phone = intlTelInput(phoneInput, {
  utilsScript: 'js/utils.js'
});

// Prevent long-polling infinite loop
localStorage.setItem('firebase:previous_websocket_failure', false);

const app = initializeApp({
  apiKey: 'AIzaSyCdKjMjf2KgLVu-OdOu1r3hn7Q2oZdSr0A',
  authDomain: 'punrelated-cloud.firebaseapp.com',
  projectId: 'punrelated-cloud',
  storageBucket: 'punrelated-cloud.appspot.com',
  messagingSenderId: '302019084968',
  appId: '1:302019084968:web:80664afab808a608bbb89d'
});

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  console.log(user);
});

// Initialize App Check
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfGT-IiAAAAAIrtM1clavC8RViMWKuvHrAClt7m'),
  isTokenAutoRefreshEnabled: true
});

// Initialize Verifier
window.verifier = new RecaptchaVerifier('send-sms-code', {
  size: 'invisible'
}, auth);

document.getElementById('sign-up-with-google').addEventListener('click', GoogleSignUp);

document.getElementById('sign-up-with-github').addEventListener('click', GithubSignUp);

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
document.getElementById('sign-up-with-email').addEventListener('click', () => EmailSignUp(emailInput.value, passwordInput.value));

document.getElementById('send-sms-code').addEventListener('click', () => {
  const phone_number = phone.getNumber();
  PhoneSignUp(phone_number);
});

const codeInput = document.getElementById('code-input');
document.getElementById('confirm-sms-code').addEventListener('click', () => {
  ConfirmCode(codeInput.value);
});

function GoogleSignUp() {
  signInWithPopup(auth, new GoogleAuthProvider)
  .then((result) => {
    const user = result.user;
    console.log(user);
  }).catch((error) => console.log(error));
}

function GithubSignUp() {
  signInWithPopup(auth, new GithubAuthProvider)
  .then((result) => {
    const user = result.user;
    console.log(user);
  })
  .catch((error) => console.log(error));
}

function EmailSignUp(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
  .then((result) => {
    const user = result.user;
    console.log(user);
    sendEmailVerification(user, {
      url: window.location.origin + '/completeProfile?username=' + email
    })
    .then(() => console.log('success!'));
  }).catch((error) => {
    if(error.code === 'auth/email-already-in-use') {
      console.log('This email already exists, perhaps login?')
      return;
    }
    console.log(error);
  });
}

function PhoneSignUp(number) {
  window.verifier.verify();
  signInWithPhoneNumber(auth, number, window.verifier)
  .then((code) => {
    console.log("Message sent successfully. " + code);
    window.confirmationCode = code;
  })
  .catch((error) => console.log(error));
}

function ConfirmCode(code) {
  window.confirmationCode.confirm(code)
  .then((result) => {
    const user = result.user;
    console.log('success!');
    console.log(user);
  })
  .catch((error) => {
    console.log(error);
  });
}