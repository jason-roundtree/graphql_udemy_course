const Query = {
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
}

export { Query as default }