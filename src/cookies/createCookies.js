

const maxAgeAccess = 60 * 1000 * 60 * 24; // 24h
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30; // 30 days

const secureCookies = true;
const createCookiesAuthen = (res, accessToken, refreshToken, userId) => 
{
    if (!userId) {
        throw new Error('UserId is null');
    }
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: maxAgeAccess,
        sameSite: 'strict',
        secure: secureCookies
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: 'strict',
        secure: secureCookies
    });

    res.cookie('userId', userId, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: 'strict',
        secure: secureCookies
    });
};

const createCookiesLogout = (res) => {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.clearCookie('userId')
};


const maxAgeAccessFP = 60 * 1000 * 60 * 5; // 5 mins

const createCookiesForgotPassword = (res, userId) => 
{
    if (!userId) {
        throw new Error('UserId is null');
    }
    res.cookie('userId', userId, {
        httpOnly: true,
        maxAge: maxAgeAccessFP,
        sameSite: 'strict',
        secure: secureCookies
    });
};

const createCookiesVerifyCode = (res, verifyCode) => 
{
    res.cookie('verifyCode', verifyCode, {
        httpOnly: true,
        maxAge: maxAgeAccessFP,
        sameSite: 'strict',
        secure: secureCookies
    });
};

const createCookiesResetPasswordSuccess = (res) => 
{
    res.clearCookie('verifyCode')
    res.clearCookie('userId')
};

module.exports = {createCookiesAuthen, createCookiesLogout, createCookiesForgotPassword,
    createCookiesVerifyCode, createCookiesResetPasswordSuccess}