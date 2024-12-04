import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ResVaultSDK from "resvault-sdk";
import NotificationModal from "pages/NotificationModal";
import TransactionLayout from "layouts/Transaction.js";

function ArtifactTransactionPage({ onLogout, token }) {
  
  const [transactionDetails, setTransactionDetails] = useState({
    name: "",
    uniqueId: "",
    origin: "",
    originYear: "",
    description: "",
    condition: "",
    curator: "",
    curatorId: "", 
    owner: "",
    imageUrl: "",
    date: "",
    
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/getId?id=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch transaction");
        }

        const data = await response.json();
        const transactionData = data.transactions;

        // Extracting required fields using regex from the transaction data
        const transactionString = JSON.stringify(transactionData);

        const nameMatch = transactionString.match(/"name":"(.*?)"/);
        const uniqueIdMatch = transactionString.match(/"uniqueId":"(.*?)"/);
        const originMatch = transactionString.match(/"origin":"(.*?)"/);
        const yearMatch = transactionString.match(/"originYear":"(.*?)"/);
        const descriptionMatch = transactionString.match(/"description":"(.*?)"/);
        
        // Setting extracted values into the state
        setTransactionDetails({
          name: nameMatch ? nameMatch[1] : "Unknown Name",
          uniqueId: uniqueIdMatch ? uniqueIdMatch[1] : "Unknown ID",
          origin: originMatch ? originMatch[1] : "Unknown Origin",
          year: yearMatch ? yearMatch[1] : "Unknown Year",
          description: descriptionMatch ? descriptionMatch[1] : "No description available",
         
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  // State for transaction form
  const [recipient, setRecipient] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
 
  const sdkRef = useRef(null);

  const fixedAmount = "44";

  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK();
  }

  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const initializePublicKey = async () => {
      try {
        const response = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation { generateKeys { publicKey privateKey } }`,
            variables: {},
          }),
        });
        const result = await response.json();
        if (result?.data?.generateKeys) {
          setRecipientPublicKey(result.data.generateKeys.publicKey);
        } else {
          throw new Error("Failed to initialize public key");
        }
      } catch (error) {
        console.error("Error initializing public key:", error);
      }
    };

    initializePublicKey();

    const messageHandler = (event) => {
      const message = event.data;

      if (
        message &&
        message.type === "FROM_CONTENT_SCRIPT" &&
        message.data &&
        message.data.success !== undefined
      ) {
        if (message.data.success) {
          setTransactionId(message.data.data.postTransaction.id);
          setModalTitle("Success");
          setModalMessage("Transaction successful! ID: " + message.data.data.postTransaction.id);
        } else {
          setModalTitle("Transaction Failed");
          setModalMessage(
            "Transaction failed: " +
              (message.data.error || JSON.stringify(message.data.errors))
          );
        }
        setShowModal(true);
      }
    };

    sdk.addMessageListener(messageHandler);

    return () => {
      sdk.removeMessageListener(messageHandler);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!recipient || !recipientPublicKey) {
      setModalTitle("Validation Error");
      setModalMessage("Please ensure both recipient and public key are initialized.");
      setShowModal(true);
      return;
    }

  

    if (sdkRef.current) {
      sdkRef.current.sendMessage({
        type: "commit",
        direction: "commit",
        amount: fixedAmount,
        data: transactionDetails,
        recipient: recipient,
        
      });
    } else {
      setModalTitle("Error");
      setModalMessage("SDK is not initialized.");
      setShowModal(true);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const handleCloseModal = () => setShowModal(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="text-blueGray-700 text-center mb-3 mt-10 font-bold text-2xl">
                <p>Transfer the Artifact</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 px-4 lg:px-10 py-10">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Artifact Name</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.name}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, name: e.target.value })
                      }
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Unique ID</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.uniqueId}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, uniqueId: e.target.value })
                      }
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Place of Origin</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.origin}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, origin: e.target.value })
                      }
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Origin Year</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="Year of Origin"
                      value={transactionDetails.year}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, year: e.target.value })
                      }
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Description</label>
                  <textarea
                    className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="Description"
                    value={transactionDetails.description}
                    onChange={(e) =>
                      setTransactionDetails({ ...transactionDetails, description: e.target.value })
                    }
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Condition</label>
                  <input
                    type="text"
                    className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={transactionDetails.condition}
                    onChange={(e) =>
                      setTransactionDetails({ ...transactionDetails, condition: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Authenticator</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.curator}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, curator: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Authenticator ID</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.curatorId}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, curatorId: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Owner/Transferee</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.owner}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, owner: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Public Key of Transferee</label>
                    <input
                      type="text"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Image Link</label>
                    <input
                      type="url"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      
                      value={transactionDetails.imageUrl}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, imageUrl: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Date</label>
                    <input
                      type="date"
                      className="form-control px-4 py-2 rounded-lg shadow-sm w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      value={transactionDetails.date}
                      onChange={(e) =>
                        setTransactionDetails({ ...transactionDetails, date: e.target.value })
                      }
                    />
                  </div>
                </div>          {/* Submit Button */}
                <div className="flex justify-center mt-6">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-3 rounded-lg shadow-md"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    
    <NotificationModal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    
    
    </>
  );
}
ArtifactTransactionPage.layout = TransactionLayout;

export default ArtifactTransactionPage;

