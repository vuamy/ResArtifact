import React, {useState} from "react";
import CardArtifact from 'components/Cards/CardArtifact';
import SortByDropdown from 'components/Dropdowns/SortByDropdown'
import IndexNavbar from 'components/Navbars/IndexNavbar';
import FooterSmall from "components/Footers/FooterDark.js";

export default function ArtifactHomepage({allArtifactsData}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState(null);
    
    const filteredArtifacts = allArtifactsData.filter((artifact) =>
      artifact.params.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sortedArtifacts = filteredArtifacts.sort((a, b) => {
        if (sortOption === "Newest Origin") {
          return b.params.year - a.params.year; 
        } else if (sortOption === "Oldest Origin") {
          return a.params.year - b.params.year; 
        } else {
          return 0; 
        }
    });

    console.log(allArtifactsData)
    allArtifactsData.map((artifact) => (
        console.log(artifact)
    ))
    return(
        <>
            <IndexNavbar fixed/>
            <section className="relative pt-20 px-6 min-h-screen pb-20">
                <div className="px-6 pt-6 ">
                    <div className="font-semibold text-4xl text-blueGray-600">
                        <h2>Artifact Collection</h2>
                    </div>
                    <div className="mt-2 mb-12 text-base text-blueGray-700">
                        View our entire collection of artifacts within our secure database. Choose a specific artifact to view
                        its information and all transactions made for it.
                    </div>
                </div>
                <hr className="border-b-1 pb-2 border-blueGray-600" />
                <div className="flex flex-row mt-10 px-12">
                    <div className="w-1/4 px-4 py-4 mr-10 bg-blueGray-400 flex flex-col items-center shadow rounded">
                        <h3 className="text-lg font-bold">Filters</h3>
                        <div className="w-full mt-4">
                            <p className="text-white text-sm font-bold block rounded uppercase mb-1">Sort By:</p>
                            <SortByDropdown onSelect={(selectedOption) => setSortOption(selectedOption)}/> </div>
                    </div>
                    <div className="w-full">
                        <form className="flex items-center justify-end" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="search"
                                id="a-search"
                                className="mr-4 border-1 border-blueGray-400 px-3 py-1 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-2 ease-linear transition-all duration-150"
                                placeholder="Artifact Name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit"
                                className="px-2 py-1  bg-blueGray-600 text-white text-xs font-bold block rounded uppercase">
                                    Search
                            </button>
                        </form>
                        <div className="flex flex-row flex-wrap px-4 mt-6 mb-6 ml-4">
                            {filteredArtifacts.map((artifact) => (
                                
                                <div key={artifact.params.id} className="mr-4 ml-4">
                                    <a href={"/artifact/" + artifact.params.id}>
                                    <CardArtifact params={artifact.params}/>
                                    </a>
                                </div>
                            ))}
                            {filteredArtifacts.length === 0 && (
                                <p className="text-center text-blueGray-600 mt-4">No artifacts found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <FooterSmall />
        </>
    )
}

const tempArtifacts = [
    {
        params: {
            id: 'holy-bible',
            name: 'Holy Bible',
            image: 'https://www.senate.gov/art-artifacts/resources/graphics/source/14_00055_001_a.jpg',
            description: "The Holy Bible, containing the Old and New testament. Translated out of the original tongues; and with the former translations diligently compared and revised, to his Majesty's special command. Appointed to be read in churches.",
            year: 1826
        }
    }, 
    {
        params: {
            id: 'impeachment-ticket',
            name: 'Impeachment Trial Ticket',
            image: "https://www.senate.gov/art-artifacts/resources/graphics/source/16_00062_001_a.jpg",
            description: "Ticket, 1868 Impeachment Trial, United States Senate Chamber",
            year: 1868
        }

        
    },
    {
        params: {
            id: 'declaration-indepdence',
            name: 'Declaration of Independence',
            image: "https://teachingamericanhistory.org/content/uploads/2021/09/3694394069_2d41fa536e_b-1.jpg",
            description: "Letter, 1776, Proclamation of American independence from British rule",
            year: 1776
        }

        
    }
    
]

export async function getStaticProps() {
    // Return a list of possible value for id
    const allArtifactsData = tempArtifacts;
    return {
        props: {
            allArtifactsData,
        }
    }
}