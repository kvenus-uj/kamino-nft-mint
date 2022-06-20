import './App.css';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz";
import { Col, Row, Button, Form, Card, Badge } from "react-bootstrap";
import AlertDismissible from './alert/alertDismissible';

import { Connection, PublicKey } from '@solana/web3.js';
import {
	Program, Provider, web3
  } from '@project-serum/anchor';
import { mintLootBox } from './utils';
const opts = {
  preflightCommitment: "processed"
}
const metadatas = [
  "https://arweave.net/gG7FdZxl-y3YY0WreZxQ13plR0cv0B-lTaKyUooVXyo",
  "https://arweave.net/Jh1SGzfox90Qc_afMu7xSjFSrHQf0rGt2r0sdn8fnaU",
  "https://arweave.net/wfQozPMvH0q8doNto1cIkM4y0vanMIFohVPGOePzPeM",
  "https://arweave.net/gG7FdZxl-y3YY0WreZxQ13plR0cv0B-lTaKyUooVXyo",
  "https://arweave.net/Jh1SGzfox90Qc_afMu7xSjFSrHQf0rGt2r0sdn8fnaU",
  "https://arweave.net/wfQozPMvH0q8doNto1cIkM4y0vanMIFohVPGOePzPeM",
];
function App(props) {
  const { publicKey } = useWallet();
  const { connection } = props;
	const wallet = useWallet();

  // input ref
  const inputRef = useRef();

  // state change
  useEffect(() => {
    setNfts([]);
    setView("collection");
    setGroupedNfts([]);
    setShow(false);
     if (publicKey) {
       inputRef.current.value = publicKey;
     }
  }, [publicKey, connection]);

  const [nfts, setNfts] = useState([]);
  const [groupedNfts, setGroupedNfts] = useState([]);
  const [view, setView] = useState('collection');
  //alert props
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  //loading props
  const [loading, setLoading] = useState(false);


  const getNfts = async (e) => {
    e.preventDefault();

    setShow(false);

    let address = inputRef.current.value;

    if (address.length === 0) {
      address = publicKey;
    }

    if (!isValidSolanaAddress(address)) {
      setTitle("Invalid address");
      setMessage("Please enter a valid Solana address or Connect your wallet");
      setLoading(false);
      setShow(true);
      return;
    }

    const connect = createConnectionConfig(connection);

    setLoading(true);
    const nftArray = await getParsedNftAccountsByOwner({
      publicAddress: address,
      connection: connect,
      serialization: true,
    });


    if (nftArray.length === 0) {
      setTitle("No NFTs found in " + props.title);
      setMessage("No NFTs found for address: " + address);
      setLoading(false);
      setView('collection');
      setShow(true);
      return;
    }

    const metadatas = await fetchMetadata(nftArray);
    var group = {};

    for (const nft of metadatas) {
      if (group.hasOwnProperty(nft.data.symbol)) {
        group[nft.data.symbol].push(nft);
      } else {
        group[nft.data.symbol] = [nft];
      }
    }
    setGroupedNfts(group);
    console.log(group);
  
    setLoading(false);
    return setNfts(metadatas);
  };

  const fetchMetadata = async (nftArray) => {
    let metadatas = [];
    for (const nft of nftArray) {
      console.log(nft);
      try {
        await fetch(nft.data.uri)
        .then((response) => response.json())
        .then((meta) => { 
          metadatas.push({...meta, ...nft});
        });
      } catch (error) {
        console.log(error);
      }
    }
    return metadatas;
  };
	const getProvider = async () => {
		/* create the provider and return it to the caller */
		/* network set to local network for now */
		const network = "https://metaplex.devnet.rpcpool.com";
		const connection = new Connection(network, opts.preflightCommitment);
	
		const provider = new Provider(
		  connection, wallet, opts.preflightCommitment,
		);
		return provider;
	}

  async function nftMint() {
    const provider = await getProvider();
    const min = 0;
    const max = 5;
    var rand = min + Math.random() * (max - min);
    rand = Math.floor(rand);
    const metadata = metadatas[rand];
    mintLootBox(provider, wallet, metadata);
  }
  return (
    <div className="main">
      <Row className="inputForm">
        <Col lg="2"> </Col>
        <Col xs="12" md="12" lg="5">
          <Form.Control
            type="text"
            readOnly
            ref={inputRef}
            placeholder="Wallet address"
          />
        </Col>
        <Col xs="12" md="12" lg="3" className="d-grid">
          <Button
            variant={props.variant.toLowerCase()}
            type="submit"
            onClick={nftMint}
          >
            {" "}
            Mint NFT from {props.title}{" "}
          </Button>
        </Col>
        <Col lg="1"></Col>
        <Col lg="1">
          {view === "nft-grid" && (
            <Button
              size="md"
              variant="danger"
              onClick={() => {
                setView("collection");
              }}
            >
              Close
            </Button>
          )}
        </Col>
      </Row>
      {loading && (
        <div className="loading">
          <img src="loading.gif" alt="loading" />
        </div>
      )}

      <Row>
        {!loading &&
          view === "collection" &&
          Object.keys(groupedNfts).map(
            (metadata, index) => (
              (
                <Col xs="12" md="6" lg="2" key={index}>
                  <Card
                    onClick={() => {
                      setNfts(groupedNfts[metadata]);
                      setView("nft-grid");
                    }}
                    className="imageGrid"
                    lg="3"
                    style={{
                      width: "100%",
                      backgroundColor: "#2B3964",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={groupedNfts[metadata][0]?.image}
                      alt={groupedNfts[metadata][0]?.name}
                      style={{
                        borderRadius: "10px",
                      }}
                    />
                    <Card.Body>
                      <span>
                        <Card.Title style={{ color: "#fff" }}>
                          {metadata}
                        </Card.Title>
                        <Badge
                          pill
                          bg={props.variant.toLowerCase()}
                          text="light"
                        >
                          <h6>{groupedNfts[metadata].length}</h6>
                        </Badge>
                      </span>
                    </Card.Body>
                  </Card>
                </Col>
              )
            )
          )}
      </Row>

      {
        <Row>
          {!loading &&
            view === "nft-grid" &&
            nfts.map((metadata, index) => (
              <Col xs="12" md="6" lg="2" key={index}>
                <Card
                  onClick={() => {
                    console.log(nfts.length);
                  }}
                  className="imageGrid"
                  lg="3"
                  style={{
                    width: "100%",
                    backgroundColor: "#2B3964",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={metadata?.image}
                    alt={metadata?.name}
                  />
                  <Card.Body>
                    <Card.Title style={{ color: "#fff" }}>
                      {metadata?.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      }

      {show && (
        <AlertDismissible title={title} message={message} setShow={setShow} />
      )}
    </div>
  );
}

export default App;
