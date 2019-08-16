import jwt from 'jsonwebtoken'

const getUserId = (request, requireAuth) => {
    const header = request.request.headers.authorization
    if (!header) {
        throw new Error('Authentication required')
    }
    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, '_my_Sexy_secret_')

    return decoded.userId
}

export { getUserId as default }