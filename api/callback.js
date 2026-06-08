module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    const { echostr, msg_signature, timestamp, nonce } = req.query;
    if (echostr) {
      return res.status(200).send(echostr);
    }
    return res.status(200).send('WinClaw Callback Service');
  }

  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    console.log('Received:', body);
    return res.status(200).json({ errcode: 0, errmsg: 'ok' });
  }

  res.status(200).send('OK');
};