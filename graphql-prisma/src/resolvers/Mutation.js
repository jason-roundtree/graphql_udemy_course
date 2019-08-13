import uuidv4 from 'uuid/v4'

const Mutation = {
    async createUser(parent, args, { prisma }, info) {
        const emailTaken = await prisma.exists.User({email: args.data.email})

        if (emailTaken) {
            throw new Error('This email is taken')
        } 

        return prisma.mutation.createUser({ data: args.data }, info)
    },
    async deleteUser(parent, args, { prisma }, info) { 
        const userExists = await prisma.exists.User({ id: args.id })

        if (!userExists) {
            throw new Error('This user doesn\'t exist')
        } 

        return prisma.mutation.deleteUser({ 
            where: {
                id: args.id 
            }
        }, info)
    },
    updateUser(parent, { data, id }, { db }, info) {
        const user = db.users.find(user => user.id === id)
        if (!user) { throw new Error('User not found')}
        if (typeof data.email === 'string') {
            const emailTaken = db.users.some(user => user.email === data.email)
            if (emailTaken) { throw new Error('Email taken' )}
        }
        if (typeof data.name === 'string') { user.name = data.name }
        if (typeof data.age !== 'undefined') { user.age = data.age }
        return user
    },
    createPost(parent, args, { db, pubSub }, info) {
        const userExists = db.users.some(user => {
            return user.id === args.data.author
        })
        if (!userExists) {
            throw new Error('User not found')
        } else {
            const post = {
                id: uuidv4(),
                ...args.data
            }
            db.posts.push(post)
            if (args.data.published) { 
                pubSub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post
                    }
                }) 
            }
            return post
        }
    },
    deletePost(parent, args, { db, pubSub }, info) {
        const postIndex = db.posts.findIndex(post => post.id === args.id)
        if (postIndex === -1) {
            throw new Error('This post doesn\'t exist')
        } else {
            const [ deletedPost ] = db.posts.splice(postIndex, 1)
            db.comments = db.comments.filter(comment => {
                return comment.post !== args.id
            })
            if (deletedPost.published) {
                pubSub.publish('post', {
                    post: {
                        mutation: 'DELETED',
                        data: deletedPost
                    }
                })
            }
            return deletedPost
        }
    },
    updatePost(parent, { data, id }, { db, pubSub }, info) {
        const post = db.posts.find(post => post.id === id)
        const originalPost = { ...post }
        if (!post) {
            throw new Error('This post doesn\'t exist')
        } else {
            if (typeof data.title === 'string') { post.title = data.title }
            if (typeof data.body === 'string') { post.body = data.body }
            if (typeof data.published === 'boolean') { 
                post.published = data.published 
                if (originalPost.published && !post.published) {
                    pubSub.publish('post', {
                        post: {
                            mutation: 'DELETED',
                            data: originalPost
                        }
                    })
                } else if (!originalPost.published && post.published) {
                    pubSub.publish('post', {
                        post: {
                            mutation: 'CREATED',
                            data: post
                        }
                    })
                } 
            } else if (post.published) {
                pubSub.publish('post', {
                    post: {
                        mutation: 'UPDATED',
                        data: post
                    }
                })
            }
            return post
        }
    },
    createComment(parent, args, { db, pubSub }, info) {
        const userExists = db.users.some(user => {
            return user.id === args.data.author
        })
        const postExists = db.posts.some(post => {
            return post.id === args.data.post && post.published
        })
        if (!userExists || !postExists) {
            throw new Error('This user or post (or both) doesn\'t exist')
        } else {
            const comment = {
                id: uuidv4(),
                ...args.data
            }
            db.comments.push(comment)
            pubSub.publish(`comment ${args.data.post}`, { 
                comment: {
                    mutation: 'CREATED',
                    data: comment
                }
            })  
            return comment
        }
    },
    deleteComment(parent, args, { db, pubSub }, info) { 
        const commentIndex = db.comments.findIndex(comment => comment.id === args.id)
        if (commentIndex === -1) {
            throw new Error('This comment doesn\'t exist')
        } else {
            const [ deletedComment ] = db.comments.splice(commentIndex, 1)
            pubSub.publish(`comment ${deletedComment.post}`, {
                comment: {
                    mutation: 'DELETED',
                    data: deletedComment
                }
            })
            return deletedComment
        }
    },
    updateComment(parent, { data, id }, { db, pubSub }, info) {
        const comment = db.comments.find(comment => comment.id === id)
        if (!comment) {
            throw new Error('This comment doesn\'t exist')
        } 
        if (typeof data.text === 'string') {
            comment.text = data.text
        }
        pubSub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        })
        return comment
    }
}

export { Mutation as default }