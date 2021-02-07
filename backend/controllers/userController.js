exports.demoRoute = (req, resp) => {
    resp.status(200).json({
        status: 'sucess',
        data: 'Hello World',
    });
};
