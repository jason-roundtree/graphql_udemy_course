import { Prisma } from 'prisma-binding'

const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://localhost:4466'
})

// const createPostForUser = async (authorId, data) => {
//     const post = await prisma.mutation.createPost({
//         data: {
//             ...data,
//             author: { 
//                 connect: {
//                     id: authorId
//                 }
//             }
//         }
//     }, '{ id }')
//     const user = await prisma.query.user({
//         where: { id: authorId }
//     }, '{ id name email posts {id title published} }')
//     return user
// }
// createPostForUser('cjyz0bnfj00bf0963zf8m20a3', {
//     title: 'createPostForUser',
//     body: 'great createPostForUser!',
//     published: true
// }).then((user) => {
//     console.log('createPostForUser: ', JSON.stringify(user, undefined, 2))
// })

const updatePostForUser = async (postId, data) => {
    const post = await prisma.mutation.updatePost({
        where: { id: postId },
        data
    }, '{ author {id} }')
    const user = await prisma.query.user({
        where: { id: post.author.id },
    }, '{ id name email posts {id, title, body, published} }')
    return user
}

// updatePostForUser('cjz0mk6wt000s09636rr3qqc9', { published: false })
//     .then((user) => {
//         console.log(JSON.stringify(user, undefined, 2))
//     })

// prisma.mutation.updatePost({
//     where: { id: "cjz0mk6wt000s09636rr3qqc9" },
//     data: {
//         body: "Oh my gersh, look at my updated post!",
//         published: false
//     }
// }, '{ id title body published }')
//     .then((data) => {
//         console.log('updatePost: ', data)
//         return prisma.query.posts(null, '{ id, title, body, published }')
//     })
//     .then((data) => {
//         console.log('allPosts: ', data)
//     })