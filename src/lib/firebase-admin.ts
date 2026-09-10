// Firebase Admin SDK Configuration (Server-side only)
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const mockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAxnIhuD6crdlD/3UMNJklIVNp4W3GAG1IfLOZ6GEN274i56RU
duA1KHnd0TT0zrqRqexWP3FFVl4y3xiXGtb0+GQGGN49HiqCsXSwh5x6abFqXtLd
rV73fNnjk4RNNdVIE7V8YHtJzPvxsTfHmNKxG5qsvbZk13ilM9XSvqZsnvT4kYaF
SZZndLGWb3Ke/vn4Az2ybEQ59UwDRxWHnLrWzhu+xVymKXL00TaRBTK5aZqx49at
L1iPkSdQ1VXZh17BnaBUVQZlNXtGyqkktyU1Zp+8RVmRXrUmd4T6DoGSRtim20kS
WFwakNsTMauRahBMkuVt/2iP5ps7KglI6PZV9QIDAQABAoIBAQCSgCOAn0iP13up
lcGC+yQ8LBZYg+/O1N7UoMqYkT3n4cBm/hwU/oR/8yfckJnCHF348i7h+z9S+YvY
w5CaEeMblMwjg73fDUcatqi0FMMSUBXVFxrsKNXQaBLoDp3phiEF28+McrgTClRt
nl5N5g018cRg8cwUfk6Hq+0/LiG2XphN0+I+4u0/vTx8FGu/6DGQ0UPtNV8jyFyu
RGZdlAK7SOUJefdzgdW5AN1obtTkdpaq8vLQdRnJJ4nMnT4ipsPYaPomzvFVeR6h
YJSdXxIdXrvFdx9LSrEJZQJg2X2z3xGoJheFgDiB3ulY1lgn9ZRGXuhuRadThwz9
wMP1Y0NBAoGBAPxlFHRN8wQgsy3AXmo5QZLYNAbGfPmHSJAe+hoyj8ELGVb6hD6e
/tHp3ABaeuszhu0CsXj1LVOjMgTskwRvCfLFkqmLiCYqpZYG0r2O/boYk5QekKuJ
ckroLiSU1hlS/W9jBXgQTTvXy+aTMAnCSLYKJLfyBWOc8wU57LKZC6SJAoGBAMlH
x28/UT8O+6q41MaeLz/cETDQiP5IiHgABpOeEr5llDVttDJuKPO+cFzel4Wj+ouL
1OfYpDjRIpsDIIPNHfeUhb5CijxEfEoXaUmRjpw+5ka2amR7Sg1Ou6zcTzuhcluS
FinS7tOJaNqmFRYoMvTQQIr5uYnZ+n8/ttE5TmMNAoGADbbMUrl9j+ba9YxzVOBB
kOIQiaG1XrWcGsCkJFJE/19EBDbegqyO+gbz/kzsSuVk2nIABKuFx/qhGCVmo6II
71kO7Al532EH2EwMnWIspTT6p9y1TazNOga9ox03OO8KeEfwHyL7n1nNaXzr6kvV
OZb5gckzw8LebZVFKDsqp8kCgYEAhuFH3t+yRSx4Ly5Ov45PIV8KUgjcVHIsqSVz
Qsahzt7pE2ihYU36uWO7jjBHn3GEOrEIihjd64kRxIiy6D+yvi7T9OxIEBzgoRHR
J1CYHVH1JBunbhBETmidUTgNDGui44QgwAQusKibEDJNXRyxEObg6YBw+dSNjWoX
y1q4kZ0CgYAkZOdtSgyceJGLcGhHvpfAW6fRket+rp1lbGBBrQbSCmlUATULB//W
ke41UiPO+Q5GV+Gf0iC3CD7qh6CxGNRG47Ye7xcXfYlOC1uWcrXwsTO6vRPT12zd
dYeME3fp3OJ70lmKI8oHaxD+WS+8PE0er1bZqAQ71wWiIRgb4DKvBQ==
-----END RSA PRIVATE KEY-----`;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "mock-project-id",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL || "mock-client-email@example.com",
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || mockPrivateKey).replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
