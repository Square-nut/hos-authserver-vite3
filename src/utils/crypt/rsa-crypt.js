import JSEncrypt from 'encryptlong/bin/jsencrypt'
// 公钥
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCuheubArsSg/yVQXs7CV1ItqWRb4Q3JjLgszoLSqTC4Rp1lbqzKv9NZIjOh0pQwQp2wdq8SFjMvjsVt3phDSY8rNFp5pMPnD/K0BrEoQV5UUfgOgGnyxRMBFYQIbQMcV7tZa/UWLPoMbioz1PcU4btDb8Y14e5jU5amiLkOMAtCwIDAQAB'
// 私钥
const privateKey = 'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAK6F65sCuxKD/JVBezsJXUi2pZFvhDcmMuCzOgtKpMLhGnWVurMq/01kiM6HSlDBCnbB2rxIWMy+OxW3emENJjys0Wnmkw+cP8rQGsShBXlRR+A6AafLFEwEVhAhtAxxXu1lr9RYs+gxuKjPU9xThu0NvxjXh7mNTlqaIuQ4wC0LAgMBAAECgYAq5SeflfA9AMvYM5wCSq7u7FWNhYdNtsnSiLq/g70zWPiT5hVZbDwL3aXyfTY62vejcMo+dNm+mRMUp2Ag8oZvAxnR6RWfnaLHZaAYWtSXW8+YJD7BrE+z6KxeD1vxGTvYTAsP3HsqzrMNyCBf3PNPK31VApl8wcShfjd/PcSm4QJBAOVtjzjBoo36NYJNBrFu62OskFwwD+78RsfhuvBU7j3Q6/kzRkLcyxnOKCeVj8eR3FXD2PEvtQQu0Pd7pxRmxkcCQQDCvHS6iibin8YetKndVAZC73sInpQv/EzPnd1dtlR45UOaVNMhbPYoisHUFOH7F6Vd1Haiqila4pW7biEGBxEdAkEAp3/4a4B7VFqTTGE9/La1ZhzrfFKen2VRq8ayu5nWIg1w6owzxMb8BQgNKvE3eoWULo2Ayn2BE9+2Mqj1T6DFKwJBAJjA24+37ui2C+LqNJS45HB9CjWorvU1I8t4ObzY2Uo8DNtyzmrZ3f3PWlvSRbGAyubfUnAmqmnwcyOjL6RaxsECQQC2IAvUI0l2Zh+MrP3m3qwwj07e3IXA7fsrnQov7dGMEJPgMstVIu0q49UkiOMp8iX7vxL3rvKXKjLdpFU0bBJi'

/**
 * RSA加密
 * @param {*} str 待加密的字符串
 * @returns
 */
const encryptRSA = (str) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey)
  const ssr = encodeURIComponent(str)
  return encryptor.encryptLong(ssr);
}
/**
 * RSA解密
 * @param {*} secretWord 待解密字符串
 * @returns
 */
const decryptRSA = (secretWord) => {
  const decoryptor = new JSEncrypt()
  decoryptor.setPrivateKey(privateKey)
  const decode = decoryptor.decryptLong(secretWord)
  return decodeURIComponent(decode)
}
export default {
  encryptRSA,
  decryptRSA
}
