import { GraphQLServer } from 'graphql-yoga'

// Scalar types: String, Boolean, Int, Float, ID

// Type definitions/schemas
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        greeting(name: String): String!
        add(grades: [Int!]!): Int!
        grades: [Int!]!
        me: User!
        post: Post!
    }
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`
// Demo user data
const users = [{
    id: '1',
    name: 'Joey John-John',
    email: 'joey@shabalagoo.john'
}, {
    id: '2',
    name: 'Barney Gumble',
    email: 'bgumble@moesbar.com'
}]
const posts = [{
    id: 9,
    title: 'Post with the Most',
    body: 'dsfj ldsjf kjsdf sdj',
    published: true 
}, {
    id: 8,
    title: 'Youhklih Bojh',
    body: 'dsf ijfsdjlk lhjjdsf',
    published: false
}]
// Resolvers
const resolvers = {
    Query: {
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            } else {
                return posts.filter(post => post.title.toLowerCase().includes(args.query.toLowerCase()))
            }
        },
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            } else {
                return users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()))
            }
        },
        add(parent, args, ctx, info) {
            if (args.grades.length === 0) {
                return 0
            } else {
                return args.grades.reduce((acc, curr) => acc + curr, 0)
            }
        },
        greeting(parent, args, ctx, info) {
            if (args.name) {
                return `Hello, ${args.name}!`
            }
            return 'Hello!'
        },
        grades(parent, args) {
            return [90, 75, 82]
        },
        me() {
            return {
                id: 2,
                name: 'Jason',
                email: 'jason@email.xxx',
            }
        },
        post() {
            return {
                id: 3,
                title: 'BlahBlah',
                body: '.....aasfdsafsa',
                published: true
            }
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