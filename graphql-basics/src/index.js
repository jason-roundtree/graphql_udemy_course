import { GraphQLServer } from 'graphql-yoga'

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
    id: 9,
    title: 'Post with the Most',
    body: 'dsfj ldsjf kjsdf sdj',
    published: true,
    author: '1'
}, {
    id: 8,
    title: 'Youhklih Bojh',
    body: 'dsf ijfsdjlk lhjjdsf',
    published: false,
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
        comments(parent, args, ctx, info) {
            return comments
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