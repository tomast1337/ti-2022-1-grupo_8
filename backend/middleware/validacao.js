const validarIdPedido = (req, res, next) => {
    // Valida se o ID foi informado
    let id = req.params.id;
    if (id == null) {
        res.status(400).json({ error: "ID não informado" }).end();
        return;
    }
    // Valida se o ID é um número
    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" }).end();
        return;
    }
    // Valida se o pedido existe
    let pedidos = getAllPedidos();
    let pedido = pedidos.find((pedido) => pedido.id == id);
    if (pedido == null) {
        res.status(400).json({ error: "Pedido não encontrado" }).end();
        return;
    }
    next();
};

module.exports = validarIdPedido;
