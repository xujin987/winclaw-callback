// WinClaw 浼佷笟寰俊鍥炶皟澶勭悊 - 鏄庢枃妯″紡
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  
  if (req.method === 'GET') {
    const { echostr } = req.query;
    if (echostr) return res.status(200).send(echostr);
    return res.status(200).send('OK');
  }

  if (req.method === 'POST') {
    return res.status(200).json({ errcode: 0, errmsg: 'ok' });
  }

  res.status(200).send('WinClaw Callback');
};