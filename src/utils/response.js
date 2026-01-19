export const ok = (res, data = null, message = "success") => {
  res.json({ success: true, message, data });
};

export const fail = (res, message = "error", status = 400) => {
  res.status(status).json({ success: false, message });
};
