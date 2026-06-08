// WinClaw 企业微信回调处理函数
// 用于验证 URL 和处理回调消息

const crypto = require('crypto');

module.exports = async (req, res) => {
  // 设置 CORS 和编码
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'GET') {
    // 企业微信 URL 验证
    const { msg_signature, timestamp, nonce, echostr } = req.query;

    if (echostr) {
      // 直接返回 echostr 验证 URL
      return res.status(200).send(echostr);
    }

    return res.status(200).send('OK');
  }

  if (req.method === 'POST') {
    // 处理回调消息
    try {
      const body = req.body;
      console.log('收到回调:', JSON.stringify(body));

      // 返回成功
      return res.status(200).json({
        errcode: 0,
        errmsg: 'ok'
      });
    } catch (err) {
      console.error('处理回调失败:', err);
      return res.status(200).json({
        errcode: 0,
        errmsg: 'ok'
      });
    }
  }

  // 其他请求
  res.status(200).send('WinClaw Callback Service');
};