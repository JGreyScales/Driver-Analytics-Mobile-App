export const emailInputSanitize = (value) => {
  return value.replace(/[^a-zA-Z0-9@.]/g, "").replace(/\s+/g, "");      
};

export const userNameInputSanitize = (value) => {
  return value.replace(/[^a-zA-Z0-9]/g, "").replace(/\s+/g, "");             
};

export const passWordInputSanitize = (value) => {
  return value.replace(/[^a-zA-Z0-9!@#$%^&*()]/g, "").replace(/[<>]/g, "").replace(/\s+/g, "");                  
};
