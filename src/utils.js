import * as anchor from"@project-serum/anchor";
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';
const { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE } = require('@solana/spl-token');


export const mintLootBox = async (provider, wallet, metadataUrl) => {
	const { SystemProgram, Keypair } = web3;
	const programID = new PublicKey(idl.metadata.address);
	const program = new Program(idl, programID, provider);
	const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
	const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(
		MINT_SIZE
	);

	const getMetadata = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
		};
	const getMasterEdition = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
				Buffer.from("edition"),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
		};
	const mintKey = anchor.web3.Keypair.generate();
	// console.log(mintKey.publicKey + "");
	const NftTokenAccount = await getAssociatedTokenAddress(
		mintKey.publicKey,
		provider.wallet.publicKey
		);
	console.log("NFT Account: ", NftTokenAccount.toBase58());

	const mint_tx = new anchor.web3.Transaction().add(
		anchor.web3.SystemProgram.createAccount({
			fromPubkey: wallet.publicKey,
			newAccountPubkey: mintKey.publicKey,
			space: MINT_SIZE,
			programId: TOKEN_PROGRAM_ID,
			lamports,
		}),
		createInitializeMintInstruction(
			mintKey.publicKey,
			0,
			wallet.publicKey,
			wallet.publicKey
		),
		createAssociatedTokenAccountInstruction(
			wallet.publicKey,
			NftTokenAccount,
			wallet.publicKey,
			mintKey.publicKey
		)
		);
	const res = await program.provider.send(mint_tx, [mintKey]);
	console.log(
		await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
	);
	console.log("Account: ", res);
	console.log("Mint key: ", mintKey.publicKey.toString());
	console.log("User: ", program.provider.wallet.publicKey.toString());
	const metadataAddress = await getMetadata(mintKey.publicKey);
	const masterEdition = await getMasterEdition(mintKey.publicKey);
	console.log("Metadata address: ", metadataAddress.toBase58());
	console.log("MasterEdition: ", masterEdition.toBase58());
	console.log(SystemProgram.programId + "")
	// get data from url
	const response = await fetch(metadataUrl);
	const data = await response.json();
	
	const tx = await program.methods.mintLootbox(
		mintKey.publicKey,
		metadataUrl,
		data.name,
		data.symbol
		)
		.accounts({
			mintAuthority: wallet.publicKey,
			mint: mintKey.publicKey,
			tokenAccount: NftTokenAccount,
			tokenProgram: TOKEN_PROGRAM_ID,
			metadata: metadataAddress,
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			payer: wallet.publicKey,
			systemProgram: SystemProgram.programId,
			rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			masterEdition: masterEdition,
		},
		)
		.rpc();
		return tx;
}

export const openLootBox = async (provider, wallet, name, symbol) => {
	const { SystemProgram, Keypair } = web3;
	const programID = new PublicKey(idl.metadata.address);
	const program = new Program(idl, programID, provider);
	const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
	const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(
		MINT_SIZE
	);

	const getMetadata = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
		};
		const getMasterEdition = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
				Buffer.from("edition"),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
		};
	const mintKey = anchor.web3.Keypair.generate();
	// console.log(mintKey.publicKey + "");
	const NftTokenAccount = await getAssociatedTokenAddress(
		mintKey.publicKey,
		provider.wallet.publicKey
		);
		console.log("NFT Account: ", NftTokenAccount.toBase58());

		const mint_tx = new anchor.web3.Transaction().add(
		anchor.web3.SystemProgram.createAccount({
			fromPubkey: wallet.publicKey,
			newAccountPubkey: mintKey.publicKey,
			space: MINT_SIZE,
			programId: TOKEN_PROGRAM_ID,
			lamports,
		}),
		createInitializeMintInstruction(
			mintKey.publicKey,
			0,
			wallet.publicKey,
			wallet.publicKey
		),
		createAssociatedTokenAccountInstruction(
			wallet.publicKey,
			NftTokenAccount,
			wallet.publicKey,
			mintKey.publicKey
		)
		);
	const res = await program.provider.send(mint_tx, [mintKey]);
	console.log(
		await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
	);
	console.log("Account: ", res);
	console.log("Mint key: ", mintKey.publicKey.toString());
	console.log("User: ", program.provider.wallet.publicKey.toString());
	const metadataAddress = await getMetadata(mintKey.publicKey);
	const masterEdition = await getMasterEdition(mintKey.publicKey);
	console.log("Metadata address: ", metadataAddress.toBase58());
	console.log("MasterEdition: ", masterEdition.toBase58());
	console.log(SystemProgram.programId + "")
	
	const tx = await program.methods.openLootbox(
		mintKey.publicKey,
		// "https://arweave.net/Isuue2pI2LM3gGozamGPX2YHNRFlLHXWFc60otl8WnY",
		name,
		symbol
		)
		.accounts({
			mintAuthority: wallet.publicKey,
			mint: mintKey.publicKey,
			tokenAccount: NftTokenAccount,
			tokenProgram: TOKEN_PROGRAM_ID,
			metadata: metadataAddress,
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			payer: wallet.publicKey,
			systemProgram: SystemProgram.programId,
			rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			masterEdition: masterEdition,
		},
		)
		.rpc();
		return tx;
}

export const getProvider = async (wallet) => {
	const network = "https://metaplex.devnet.rpcpool.com";
	const connection = new Connection(network, 'processed');

	const provider = new Provider(
		connection, wallet, 'processed',
	);
	return provider;
}