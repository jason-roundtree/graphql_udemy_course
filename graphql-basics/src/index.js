import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'
import db from './db'

// Scalar types: String, Boolean, Int, Float, ID

// Resolvers
const resolvers = {
    Query: {
        users(parent, args, { db }, info) {
            if (!args.data.query) {
                return db.users
            }
            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.data.query.toLowerCase())
            })
        },
        posts(parent, args, { db }, info) {
            if (!args.data.query) {
                return db.posts
            }
            return db.posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.data.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.data.query.toLowerCase())
                return isTitleMatch || isBodyMatch
            })
        },
        comments(parent, args, { db }, info) {
            return db.comments
        }
    },
    
    Mutation: {
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
                throw new Error('A post with this ID doesn\'t exist')
            } else {
                const [ deletedPost ] = db.posts.splice(postIndex, 1)
                db.comments = db.comments.filter(comment => comment.post !== args.id)
                return deletedPost
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
        }
    },
    Post: {
        author(parent, args, { db }, info) {
            return db.users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, { db }, info) {
            return db.comments.filter(comment => {
                return comment.post === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, { db }, info) {
            return db.users.find(user => {
                return user.id === parent.author
            })
        },
        post(parent, args, { db }, info) {
            return db.posts.find(post => {
                return post.id === parent.post
            })
        }
    },
    User: {
        posts(parent, args, { db }, info) {
            return db.posts.filter(post => {
                return post.author === parent.id
            })
        },
        comments(parent, args, { db }, info) {
            return db.comments.filter(comment => {
                return comment.author === parent.id
            })
        }
    }
}

const server = new GraphQLServer({
    // this path is relative to root of app
    typeDefs: './src/schema.graphql',
    resolvers,
    context: {
        db
    }
})

server.start(() => {
    console.log('Server is running')
})