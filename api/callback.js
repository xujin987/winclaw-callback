// WinClaw 企业微信回调处理
// 支持加密模式 URL 验证

const crypto = require('crypto');

// 企业微信配置 - 从 WinClaw 配置中获取
const TOKEN = 'ZJhFw7GYar91TEY';
const ENCODING_AES_KEY = 'Y4XHs5bFX2gZNHO5FWW5xUZStOKi08MNE94d5mVG2NV';

// PKCS7 解码
function decodePKCS7(buf) {
  const pad = buf[buf.length - 1];
  if (pad < 1 || pad > 32) pad = 0;
  return buf.slice(0, buf.length - pad);
}

// AES 解密
function decryptAES(encryptedBase64, aesKey) {
  const aesKeyBuf = Buffer.from(aesKey + '=', 'base64');
  const encryptedBuf = Buffer.from(encryptedBase64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKeyBuf, aesKeyBuf.slice(0, 16));
  decipher.setAutoPadding(false);

  let decrypted = decipher.update(encryptedBuf);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  decrypted = decodePKCS7(decrypted);

  // 解析内容: 16字节随机串 + 4字节网络字节序(msg长度) + msg + 企业微信CorpID
  const msgLenBuf = decrypted.slice(16, 20);
  const msgLen = msgLenBuf.readUInt32BE(0);
  const msg = decrypted.slice(20, 20 + msgLen).toString('utf8');

  return msg;
}

// SHA1 签名验证
function verifySignature(token, timestamp, nonce, echostr, signature) {
  const arr = [token, timestamp, nonce, echostr].sort();
  const sha1 = crypto.createHash('sha1');
  sha1.update(arr.join(''));
  return sha1.digest('hex') === signature;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'GET') {
    const { msg_signature, timestamp, nonce, echostr } = req.query;

    if (echostr) {
      try {
        // 验证签名
        const valid = verifySignature(TOKEN, timestamp, nonce, echostr, msg_signature);

        if (!valid) {
          console.error('签名验证失败');
          return res.status(200).send('error');
        }

        // AES 解密 echostr
        const decrypted = decryptAES(echostr, ENCODING_AES_KEY);
        console.log('URL验证成功, 解密内容:', decrypted);

        // 返回解密后的 echostr
        return res.status(200).send(decrypted);
      } catch (err) {
        console.error('URL验证异常:', err.message);
        // 如果解密失败，直接返回 echostr（兼容明文模式）
        return res.status(200).send(echostr);
      }
    }

    return res.status(200).send('OK');
  }

  if (req.method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      console.log('收到回调:', body);
      return res.status(200).json({ errcode: 0, errmsg: 'ok' });
    } catch (err) {
      console.error('处理回调失败:', err);
      return res.status(200).json({ errcode: 0, errmsg: 'ok' });
    }
  }

  res.status(200).send('WinClaw Callback Service');
};
