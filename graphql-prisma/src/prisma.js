import { Prisma } from 'prisma-binding'

const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://localhost:4466'
})

const createPostForUser = async (authorId, data) => {
    const userExists = await prisma.exists.User({ id: authorId })
    
    if (!userExists) {
        throw new Error('User not found')
    }

    const post = await prisma.mutation.createPost({
        data: {
            ...data,
            author: { 
                connect: {
                    id: authorId
                }
            }
        }
    }, '{ author {id name email posts {id title body published}} }')
    return post.author
}

createPostForUser('cjyz0bnfj00bf0963zf8m20a3', {
    title: 'hgj hghgh  gjhghjghj hg',
    body: 'great hjhjh hjhjjkh hjhhkjhj!',
    published: true
}).then((user) => {
    console.log('createPostForUser: ', JSON.stringify(user, undefined, 2))
}).catch((err) => console.log(err))


const updatePostForUser = async (postId, data) => {
    const postExists = await prisma.exists.Post({ id: postId })

    if (!postExists) {
        throw new Error('This post does not exist')
    }

    const post = await prisma.mutation.updatePost({
        where: { id: postId },
        data
    }, '{ author {id name email posts {id, title, body, published} } }')
  
    return post.author
}

updatePostForUser('cjz0mk6wt000s09636rr3qqc9', { published: false })
    .then((user) => {
        console.log(JSON.stringify(user, undefined, 2))
    })
    .catch((err) => console.log(err))

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