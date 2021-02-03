import Web3 from "web3";

const getWeb3 = () => {
  return new Promise(async (resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
  
      //Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          //console.log("odern browser");
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
    //   else if (window.web3) {
    //     // Use Mist/MetaMask's provider.
    //     const web3 = window.web3;
    //     console.log("Injected web3 detected.");
    //     resolve(web3);
    //   }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          "https://ropsten.infura.io/v3/eaf58e744a7b4555a054e920e76fad12"
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
    
};

export { getWeb3 };
