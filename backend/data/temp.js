// Cria JSONs do banco de dados falso

const { Usuario } = require("../negocio");

let ingredientes = [
    {
        id: 1,
        imagem: "imgs/igrediente/molho_de_tomate.jpg",
        nome: "Molho",
        preco: 0.6,
        usados: 15,
        descricao: "Molho - 0.75",
        pesoPorcao: 53,
    },
    {
        id: 2,
        imagem: "imgs/igrediente/queijo-musssarela.jpg",
        nome: "Queijo",
        preco: 0.52,
        usados: 16,
        descricao: "Queijo - 0.75",
        pesoPorcao: 29,
    },
    {
        id: 3,
        imagem: "imgs/igrediente/Calabresa.jpg",
        nome: "Calabresa",
        preco: 0.99,
        usados: 18,
        descricao: "Calabresa - 6.45",
        pesoPorcao: 86,
    },
    {
        id: 4,
        imagem: "imgs/igrediente/Presunto.jpg",
        nome: "Presunto",
        preco: 0.78,
        usados: 35,
        descricao: "Presunto - 8.5",
        pesoPorcao: 90,
    },
    {
        id: 5,
        imagem: "imgs/igrediente/Camarao.webp",
        nome: "Camarão",
        preco: 0.81,
        usados: 20,
        descricao: "Camarão - 4.86",
        pesoPorcao: 18,
    },
    {
        id: 6,
        imagem: "imgs/igrediente/Alho.jpg",
        nome: "Alho",
        preco: 0.92,
        usados: 92,
        descricao: "Alho - 4.75",
        pesoPorcao: 22,
    },
    {
        id: 7,
        imagem: "imgs/igrediente/Ovo.jpg",
        nome: "Ovo",
        preco: 0.82,
        usados: 13,
        descricao: "Ovo - 5.32",
        pesoPorcao: 95,
    },
    {
        id: 8,
        imagem: "imgs/igrediente/Azeitona verde.webp",
        nome: "Azeitona verde",
        preco: 0.85,
        usados: 1,
        descricao: "Azeitona verde - 5.86",
        pesoPorcao: 9,
    },
    {
        id: 9,
        imagem: "imgs/igrediente/Azeitona preta.jpg",
        nome: "Azeitona preta",
        preco: 0.55,
        usados: 13,
        descricao: "Azeitona preta - 4",
        pesoPorcao: 80,
    },
    {
        id: 10,
        imagem: "imgs/igrediente/Tomate.jpg",
        nome: "Tomate",
        preco: 0.95,
        usados: 23,
        descricao: "Tomate - 4.5",
        pesoPorcao: 67,
    },
    {
        id: 11,
        imagem: "imgs/igrediente/Cebola.png",
        nome: "Cebola",
        preco: 0.69,
        usados: 39,
        descricao: "Cebola - 2",
        pesoPorcao: 98,
    },
    {
        id: 12,
        imagem: "imgs/igrediente/Frango desfiado.jpg",
        nome: "Frango desfiado",
        preco: 0.62,
        usados: 79,
        descricao: "Frango desfiado - 7.99",
        pesoPorcao: 82,
    },
    {
        id: 13,
        imagem: "imgs/igrediente/Requeijão.jpg",
        nome: "Requeijão",
        preco: 0.92,
        usados: 77,
        descricao: "Requeijão - 5",
        pesoPorcao: 81,
    },
    {
        id: 14,
        imagem: "imgs/igrediente/Pimentão verde.webp",
        nome: "Pimentão verde",
        preco: 0.51,
        usados: 23,
        descricao: "Pimentão verde - 5.66",
        pesoPorcao: 66,
    },
    {
        id: 15,
        imagem: "imgs/igrediente/Manjericão.jpg",
        nome: "Manjericão",
        preco: 0.72,
        usados: 47,
        descricao: "Manjericão - 6.6",
        pesoPorcao: 88,
    },
    {
        id: 16,
        imagem: "imgs/igrediente/Bacon.webp",
        nome: "Bacon",
        preco: 0.86,
        usados: 16,
        descricao: "Bacon - 5",
        pesoPorcao: 21,
    },
    {
        id: 17,
        imagem: "imgs/igrediente/Brócolis.jpg.crdownload",
        nome: "Brócolis",
        preco: 0.6,
        usados: 25,
        descricao: "Brócolis - 6",
        pesoPorcao: 78,
    },
    {
        id: 18,
        imagem: "imgs/igrediente/Pepperoni.webp",
        nome: "Pepperoni",
        preco: 0.64,
        usados: 23,
        descricao: "Pepperoni - 8.55",
        pesoPorcao: 46,
    },
];

let pizzas = [
    {
        nome: "Calabresa",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela, calabresa, azeitona e orégano.",
        imagem: "/imgs/pizza-calabresa.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 0,
        ingredientes: [0],
        quant_comprada: 175,
    },
    {
        nome: "Pizza de Mussarela",
        descricao:
            "Básica mas ainda gostosa, pizza com molho de tomate, mussarela e orégano.",
        imagem: "/imgs/pizza-mussarela.webp",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 1,
        ingredientes: [5],
        quant_comprada: 142,
    },
    {
        nome: "Da Casa",
        descricao:
            "Sabor original da pizzaria, contendo molho de tomate, mussarela, peperoni, cebola e pimentão verde.",
        imagem: "/imgs/pizza-da-casa.webp",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 2,
        ingredientes: [15, 6, 7, 8, 11],
        quant_comprada: 120,
    },
    {
        nome: "Frango com Requeijão",
        descricao:
            "A mais querida! Pizza com molho de tomate, frango desfiado, queijo, requeijão e orégano",
        imagem: "/imgs/Frango com Requeijão.jpeg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 3,
        ingredientes: [9, 10, 14, 15],
        quant_comprada: 115,
    },
    {
        nome: "Brócolis",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela, brócolis e orégano.",
        imagem: "/imgs/brocolis.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 4,
        ingredientes: [14, 15, 6],
        quant_comprada: 45,
    },
    {
        nome: "Brócolis com Alho",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela, brócolis, alho e orégano.",
        imagem: "/imgs/brocolis e alho.jpeg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 5,
        ingredientes: [14, 15, 3],
        quant_comprada: 75,
    },
    {
        nome: "Margherita",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela de búfala, manjericão, queijo parmesão ralado, tomates e azeite.",
        imagem: "/imgs/Margherita.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 6,
        ingredientes: [5, 14, 15, 11],
        quant_comprada: 74,
    },
    {
        nome: "Bacon",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela, bacon e orégano.",
        imagem: "/imgs/bacon.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 7,
        ingredientes: [13, 14, 15],
        quant_comprada: 76,
    },
    {
        nome: "Portuguesa",
        descricao:
            "Uma pizza com calabresa, tomates, mussarela, cebolas e azeitonas pretas.",
        imagem: "/imgs/Portuguesa.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 8,
        ingredientes: [0, 6, 7, 8, 11],
        quant_comprada: 23,
    },
    {
        nome: "Napolitana",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela e manjericão.",
        imagem: "/imgs/pizza-napolitana.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 9,
        ingredientes: [5, 14, 15],
        quant_comprada: 85,
    },
    {
        nome: "4 Queijos",
        descricao:
            "Deliciosa pizza com molho de tomate, mussarela, gorgonzola, requeijão e parmesão.",
        imagem: "/imgs/4 Queijos.webp",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 10,
        ingredientes: [5, 14, 15, 6, 11],
        quant_comprada: 56,
    },
    {
        nome: "Tropical",
        descricao: "Deliciosa pizza com mussarela, camarão, bacon e abacaxi.",
        imagem: "/imgs/Tropical.jpg",
        quant_queijo: 1.0,
        quant_molho: 1.0,
        id: 11,
        ingredientes: [5, 13, 14, 15],
        quant_comprada: 14,
    },
];

let produtos = [
    {
        nome: "Coca Cola 2L",
        descricao: "Refrigerante sabor cola de 2L.",
        imagem: "imgs/coca-cola.webp",
        preco: 8.0,
        id: 100,
        quant_comprada: 625,
    },
    {
        nome: "Fanta Laranja 2L",
        descricao: "Refrigerante sabor laranja de 2L.",
        imagem: "imgs/fanta.webp",
        preco: 8.0,
        id: 102,
        quant_comprada: 382,
    },
    {
        nome: "Guaraná 2L",
        descricao: "Refrigerante sabor guaraná de 2L.",
        imagem: "imgs/guarana.webp",
        preco: 8.0,
        id: 103,
        quant_comprada: 425,
    },
    {
        nome: "Heineken 600ml",
        descricao: "Cerveja HEINEKEN Garrafa 600ml",
        imagem: "imgs/heineken-original-bottle.png",
        preco: 8.0,
        id: 104,
        quant_comprada: 348,
    },
    {
        nome: "Mousse de Chocolate 50g",
        descricao:
            "Sobremesa leve com base de chocolate em barra meio amargo e creme de leite. Aerada, com leve toque de chocolate branco para dar crocância.",
        imagem: "imgs/mousse-de-chocolate.png",
        preco: 5.0,
        id: 105,
        quant_comprada: 123,
    },
    {
        nome: "Mousse de Limão 50g",
        descricao: "Mousse de Limão",
        imagem: "imgs/mousse-de-limao.png",
        preco: 5.0,
        id: 106,
        quant_comprada: 189,
    },
    {
        nome: "Mousse de Maracujá 50g",
        descricao:
            "Sobremesa aerada que leva suco de maracujá fresco, creme de leite e leite condensado. Leve, com um sabor cítrico e doce a cada colherada, finaliza qualquer almoço ou jantar.",
        imagem: "imgs/mousse-de-maracuja.png",
        preco: 5.0,
        id: 107,
        quant_comprada: 168,
    },
    {
        nome: "Suco de Laranja 1L",
        descricao: "Suco de Laranja Del Valle sabor Laranja 1L",
        imagem: "imgs/suco-de-lagranja-com-gominhos-del-valle-1L.png",
        preco: 4.0,
        id: 108,
        quant_comprada: 125,
    },
    {
        nome: "Suco de Uva 1L",
        descricao: "Suco de Laranja Del Valle sabor uva 1L",
        imagem: "imgs/suco-de-uva-del-valle-frut-1l.jpg",
        preco: 4.0,
        id: 109,
        quant_comprada: 185,
    },
    {
        nome: "Suco de Pêssego 1L",
        descricao: "Suco de Laranja Del Valle sabor pêssego 1L",
        imagem: "imgs/suco-pessego-del-valle-frut-1l..png",
        preco: 4.0,
        id: 110,
        quant_comprada: 158,
    },
];

const usuarios = [
    {
        login: "admin",
        senha: "admin",
        type: "admin",
    },
    {
        login: "user",
        senha: "123",
        type: "user",
    },
];

function main() {
    console.log("Iniciando...");
    // fs module
    const fs = require("fs");
    const prettier = require("prettier");

    // pizzas
    let novasPizzas = pizzas.map((pizza) => {
        return {
            id: pizza.id,
            nome: pizza.nome,
            descricao: pizza.descricao,
            imagem: pizza.imagem,
            preco: pizza.preco,
            ingredientes: pizza.ingredientes,
            quant_comprada: pizza.quant_comprada,
        };
    });

    const database = {
        ingredientes: ingredientes,
        pizzas: novasPizzas,
        produtos: produtos,
        usuarios: usuarios,
    };

    fs.writeFile(
        "database.json",
        prettier.format(JSON.stringify(database), { parser: "json" }),
        (err) => {
            if (err) throw err;
            console.log("The file has been saved!");
        }
    );
    console.log("Finalizado!");
}

main();
