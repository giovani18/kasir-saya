import cookie from 'cookie';

export default async function handler(req, res) {
  // Clear the cookie by setting maxAge to 0 and expires in the past
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/'
  }));

  return res.status(200).json({ success: true, message: 'Berhasil keluar' });
}
