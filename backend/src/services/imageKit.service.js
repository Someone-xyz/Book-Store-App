const { ImageKit, toFile } = require('@imagekit/nodejs');
const env = require('../config/env.js');

// SDK v7 only needs the private key (public key / url endpoint are not constructor options).
const imagekit = new ImageKit({ privateKey: env.imagekitPrivateKey });

async function uploadFile(buffer, fileName, folder = '/bookstore') {
  const file = await toFile(buffer, fileName);
  return imagekit.files.upload({ file, fileName, folder });
}

module.exports = { uploadFile, imagekit };
