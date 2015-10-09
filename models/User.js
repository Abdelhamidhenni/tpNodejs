module.exports = {
    identity: 'user',
    connection: 'myLocalDisk',
    attributes: {
        pseudo: {
            type: 'string',
            required: true,
        },
        password: {
            type: 'string',
            required: true
        }
    }
}
