import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

// Scalar types: String, Boolean, Int, Float, ID

// Demo user data
const users = [{
    id: '1',
    name: 'Joey John-John',
    email: 'joey@shabalagoo.john',
}, {
    id: '2',
    name: 'Barney Gumble',
    email: 'bgumble@moesbar.com',
}]
const posts = [{
    id: '9',
    title: 'Post with the Most',
    body: 'dsfj ldsjf kjsdf sdj',
    published: true,
    author: '1'
}, {
    id: '8',
    title: 'Youhklih Bojh',
    body: 'dsf ijfsdjlk lhjjdsf',
    published: true,
    author: '2'
}]
const comments = [{
    id: 1,
    text: 'dakfjdl lksdfj dsjflksdj',
    author: '1',
    post: 9
}, {
    id: 2,
    text: 'rweuwe uhkj hkyuioy uy uiyo',
    author: '2',
    post: 9
}]
// Type definitions/schemas
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }
    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }
    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
    
`

// Resolvers
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }
            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }
            return posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
                return isTitleMatch || isBodyMatch
            })
        },
    },
    
    Mutation: {
        createUser(parent, args, ctx, info) {
            console.log(args)
            const emailTaken = users.some(user => {
                return user.email === args.email
            })
            if (emailTaken) {
                throw new Error('This email is taken')
            } else {
                const user = { 
                    id: uuidv4(),
                    ...args
                }
                users.push(user)
                return user
            }
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some(user => {
                return user.id === args.author
            })
            if (!userExists) {
                throw new Error('User not found')
            } else {
                const post = {
                    id: uuidv4(),
                    ...args
                }
                posts.push(post)
                return post
            }
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some(user => {
                return user.id === args.author
            })
            const postExists = posts.some(post => {
                return post.id === args.post && post.published
            })
            if (!userExists || !postExists) {
                throw new Error('This user or post (or both) doesn\'t exist')
            } else {
                const comment = {
                    id: uuidv4(),
                    ...args
                }
                comments.push(comment)
                return comment
            }
        }
    },

    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter(comment => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter(post => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter(comment => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find(user => {
                return user.id === parent.author
            })
        },
        post(parent, args, ctx, info) {
            return posts.find(post => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(() => {
    console.log('Server is running')
})