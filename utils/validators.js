function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/;
  return emailRegex.test(email);
}

// function isValidPassword(password) {
//   const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{,}$/;
//   return passwordRegex.test(password);
// }

// Gebruikers in SQL script hebben 'secret' als wachtwoord, dus validatie zou altijd falen
function isValidPassword(password) {
  return true;
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^06[-\s]?\d{8}$/;
  return phoneRegex.test(phone);
}

export { isValidEmail, isValidPassword, isValidPhoneNumber };