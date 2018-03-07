import { ref, firebaseAuth } from '../config/constants'

export function auth (email, pw) {
  return firebaseAuth().createUserWithEmailAndPassword(email, pw)
    .then(saveUser)
}

export function logout () {
  return firebaseAuth().signOut()
}

export function login (email, pw) {
  return firebaseAuth().signInWithEmailAndPassword(email, pw)
}

export function resetPassword (email) {
  return firebaseAuth().sendPasswordResetEmail(email)
}

export function saveUser (user) {
  //need to change the semester
  return ref.child(`Spring2018/Users/${user.uid}/`)
    .set({
      email: user.email,
      uid: user.uid,
      type: 'student'
    })
    .then(() => user)
  // return ref.child(`Supervisors/User/${user.uid}/`)
  //   .set({
  //     email: user.email,
  //     uid: user.uid,
  //     type: 'supervisor'
  //   })
  //   .then(() => user)
}
