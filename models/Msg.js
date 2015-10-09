module.exports = {
    identity: 'message',
    connection: 'myLocalDisk',
    attributes: {
        message: {
            type: 'string'
        },
        author: {
            type: 'string'
        },
        time: {
            type: 'datetime'
        }
    }
}
