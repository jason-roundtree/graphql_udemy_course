import uuidv4 from 'uuid/v4'

const Mutation = {
    createUser(parent, args, { db }, info) {
        console.log(args)
        const emailTaken = db.users.some(user => {
            return user.email === args.data.email
        })
        if (emailTaken) {
            throw new Error('This email is taken')
        } else {
            const user = { 
                id: uuidv4(),
                ...args.data
            }
            db.users.push(user)
            return user
        }
    },
    deleteUser(parent, args, { db }, info) { 
        const userIndex = db.users.findIndex(user => user.id === args.id)
        if (userIndex === -1) {
            throw new Error('User not found')
        } else {
            const [ deletedUser ] = db.users.splice(userIndex, 1)
            db.posts = db.posts.filter(post => {
                const match = post.author === args.id
                if (match) {
                    db.comments = db.comments.filter(comment => {
                        return comment.post !== post.id
                    })
                }
                return !match
            })
            db.comments = db.comments.filter(comment => {
                comment.author !== args.id
            })
            return deletedUser
        }
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
    createPost(parent, args, { db }, info) {
        const userExists = db.users.some(user => user.id === args.data.author)
        if (!userExists) {
            throw new Error('User not found')
        } else {
            const post = {
                id: uuidv4(),
                ...args.data
            }
            db.posts.push(post)
            return post
        }
    },
    deletePost(parent, args, { db }, info) {
        const postIndex = db.posts.findIndex(post => post.id === args.id)
        if (postIndex === -1) {
            throw new Error('This post doesn\'t exist')
        } else {
            const [ deletedPost ] = db.posts.splice(postIndex, 1)
            db.comments = db.comments.filter(comment => comment.post !== args.id)
            return deletedPost
        }
    },
    updatePost(parent, { data, id }, { db }, info) {
        const post = db.posts.find(post => post.id === id)
        if (!post) {
            throw new Error('This post doesn\'t exist')
        } else {
            if (typeof data.title === 'string') { post.title = data.title }
            if (typeof data.body === 'string') { post.body = data.body }
            if (typeof data.published === 'string') { post.published = data.bpublishedody }
            return post
        }
    },
    createComment(parent, args, { db }, info) {
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
            return comment
        }
    },
    deleteComment(parent, args, { db }, info) { 
        const commentIndex = db.comments.findIndex(comment => comment.id === args.id)
        if (commentIndex === -1) {
            throw new Error('This comment doesn\'t exist')
        } else {
            const [ deletedComment ] = db.comments.splice(commentIndex, 1)
            return deletedComment
        }
    },
    updateComment(parent, { data, id }, { db }, info) {
        const comment = db.comments.find(comment => comment.id === id)
        if (!comment) {
            throw new Error('This comment doesn\'t exist')
        } else {
            if (typeof data.text === 'string') {
                comment.text = data.text
                return comment
            }
        }
    }
}

export { Mutation as default }