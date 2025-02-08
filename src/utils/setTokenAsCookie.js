const setTokenAsCookie = (res, token) => {
  res.cookie("swissmote", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default setTokenAsCookie;
