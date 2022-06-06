import React, { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import MenuNav from "./menu-nav";
import { ingredientes as ingredientesBD } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { adicionarAoCarrinho as mandaPCarrinho } from "../../features/carrinhoSlice";
import { createBrowserHistory } from "history";
import Metade from "../geral/metade-pizza";
import { selectMetades } from "../../features/ingredientes-metadeSlice";
import { ingredientes as ingredientesDB } from "../store";

/* 
Componente: CriarPizza
Descrição:  Componente que renderiza a página de criação de pizza
*/
const CriarPizza = () => {
    // Dispatch do Redux
    const dispatch = useDispatch();

    // Variáveis que controlam estados do componente.
    const [tamanho, setTamanho] = useState("");
    const [precoTotal, setPrecoTotal] = useState(0);
    const [erro, setErro] = useState("");
    const ingredientes = useSelector(selectMetades);

    const getNomePizzaFromIngredientes = (ingredientes, tamanho) => {
        let nome = "Pizza " + tamanho;

        // Achatar metades, remover duplicados, e remover molho da lista
        const flatIngredientes = [...new Set(ingredientes.flat())].filter(
            (id) => id != -2
        );

        const prefixos = ["de", "com", "e"];

        for (let i = 0; i < 3; i++) {
            if (flatIngredientes.length <= 0) break;
            const idIngrediente = sortear(flatIngredientes);
            const nomeIngrediente = getNomeIngredienteFromId(idIngrediente);
            const prefixo = prefixos[Math.min(i, prefixos.length - 1)];

            nome += " " + prefixo + " " + nomeIngrediente;
        }
        console.log(nome);
        return nome;
    };

    const getNomeIngredienteFromId = (id) => {
        return ingredientesBD.find((ingrediente) => ingrediente.id == id).nome;
    };

    const sortear = (arr) => {
        const item = arr[Math.floor(Math.random() * arr.length)];
        arr.splice(arr.indexOf(item), 1);
        return item;
    };

    // função que adiciona a pizza customizada ao carrinho
    const adicionarAoCarrinho = () => {
        if (erro !== "") {
            document.getElementById(`erro_message`).scrollIntoView({
                behavior: "auto",
                block: "center",
            });
            document.getElementById(`erro_message`).animate(
                {
                    color: "yellow",
                    textShadow: "50px 50px 50px red",
                },
                1000
            );
            return;
        }
        if (tamanho === "") {
            setErro("Selecione um tamanho");
            document.getElementById(`erro_message`).scrollIntoView({
                behavior: "auto",
                block: "center",
            });
        } else {
            const generate_id = () => {
                // Generate a id based on the tamanho and ingredientes
                return crypto.randomUUID();
            };
            atualizarPreco();
            // Gerar objeto da pizza customizada
            let pizza = {
                id: generate_id(),
                nome: getNomePizzaFromIngredientes(ingredientes, tamanho),
                preco: precoTotal,
                quantidade: 1,
                tamanho: tamanho,
                Metades: ingredientes,
                descricao: "Ingredientes: " + ingredientes.flat().join(", "),
            };
            // Adicionar a pizza customizada ao carrinho
            dispatch(mandaPCarrinho(pizza));
            // Redirecionar para a página de carrinho
            window.location.replace("/carrinho");
        }
    };

    const atualizarPreco = () => {
        let preco = 0;
        switch (tamanho) {
            case "Pequena":
                preco += 10;
                break;
            case "Media":
                preco += 15;
                break;
            case "Grande":
                preco += 20;
                break;
            case "Familia":
                preco += 25;
                break;
            default:
                break;
        }

        ingredientes.flat().forEach((id) => {
            let ingredienteObj = ingredientesBD.find((i) => {
                return i.id === parseInt(id);
            });
            preco += ingredienteObj.preco;
        });

        setPrecoTotal(preco);
    };

    const handleTamanhoRadio = (e) => {
        let valor = e.target.value;
        setTamanho(valor);
        setErro("");
        document.getElementById("INGREDIENTES").scrollIntoView({
            behavior: "smooth",
        });
    };

    useEffect(() => {
        if (erro) {
            setErro("");
        }
        if (tamanho === "") {
            setErro("Selecione um tamanho");
        } else {
            atualizarPreco();
        }
    }, [tamanho , ingredientes]);

    // Renderiza a página de criação de pizza.
    return (
        <>
            <MenuNav Atual="criar-pizza" />
            <form>
                <div className="container">
                    <div className="row">
                        <h1 className="text-center">Monte sua pizza 🍕</h1>
                    </div>
                    <div className="row">
                        <h5
                            className="text-center"
                            id="erro_message"
                            style={{
                                color: "red",
                                textShadow: "0px 0px 10px black",
                            }}
                        >
                            {erro}
                        </h5>
                    </div>
                    <div className="row section">
                        <p>
                            <b>Tamanho</b>
                        </p>
                        <div>
                            <div className="form-check form-switch">
                                <div
                                    className="tamanho p-2"
                                    onChange={handleTamanhoRadio}
                                    style={{
                                        width: "50%",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    <div className="col mb-1">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            value="Pequena"
                                            id="Pequena"
                                            name="tamanho"
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="tamanho1"
                                        >
                                            {"Pequena 🤏 15cm"}
                                        </label>
                                    </div>
                                    <div className="col mb-1">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            value="Media"
                                            id="Media"
                                            name="tamanho"
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="tamanho2"
                                        >
                                            {"Media 🫄🏻 20cm"}
                                        </label>
                                    </div>
                                    <div className="col mb-1">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            value="Grande"
                                            id="Grande"
                                            name="tamanho"
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="tamanho3"
                                        >
                                            {"Grande 📏 25cm"}
                                        </label>
                                    </div>
                                    <div className="col mb-1">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            value="Familia"
                                            id="Familia"
                                            name="tamanho"
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="tamanho4"
                                        >
                                            {"Família 😱 40cm"}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ textAlign: "center" }}>
                        <h3 id="INGREDIENTES">Ingredientes</h3>
                        <h4
                            style={{
                                color: "white",

                                textShadow: "1px 1px 4px black",
                            }}
                        >
                            Escolha até 7 em cada metade
                        </h4>
                    </div>
                    <Metade max_ingredientes={5} key="1" id={1} active={true} />
                </div>
                <hr />
                <div className="row">
                    <div
                        className="col-md-12"
                        style={{
                            textAlign: "right",
                            marginBottom: "20px",
                        }}
                    >
                        <h3>Preço total:</h3>
                        <h3>
                            {erro === ""
                                ? "R$: " + precoTotal.toFixed(2)
                                : "Tamanho não selecionado"}
                        </h3>
                    </div>
                </div>
            </form>
            <div className="row" style={{ textAlign: "center" }}>
                <Link
                    to="/menu"
                    style={{ margin: " 0 5px" }}
                    className="btn btn-lg btn-danger mb-5"
                >
                    Cancelar
                </Link>

                <button
                    className="btn btn-lg btn-primary mb-5"
                    onClick={adicionarAoCarrinho}
                >
                    Adicionar ao carrinho
                </button>
            </div>
        </>
    );
};

export default CriarPizza;
