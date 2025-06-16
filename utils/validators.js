function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^06[-\s]?\d{8}$/;
  return phoneRegex.test(phone);
}

export { isValidEmail, isValidPassword, isValidPhoneNumber };