import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import Cookies from 'js-cookie';
import '../css/post.css'
import Preview from '../components/preview';

export default function Results() {
    let location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);

    let searchQuery = null;

    if (queryParams.get('query')) {
        searchQuery = queryParams.get('query');
    }

    let at = 0;
    let to = 100;

    if (queryParams.get('at') && queryParams.get('to')) {
        at = parseInt(queryParams.get('at')) || 0;
        to = parseInt(queryParams.get('to')) || 100;
    }

    let [posts, setPosts] = useState([]);
    let [noPosts, setnoPosts] = useState(false);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch(`/api/search?query=${searchQuery}`, {
                    headers: {
                        'Authorization' : localStorage.getItem("opnidea-session")
                    }
                });
    
                if (response.status != 200) {
                    setnoPosts(true);
                    return;
                }
    
                let data = await response.json();
    
                if (data.length == 0) {
                    setnoPosts(true);
                    return;
                }
    
                setPosts(data)
            }
            catch(error) {
                console.log(error);
                alert('Something went wrong, please try again in a bit. You might be ratelimited also.');
            }   
        }

        if (posts.length == 0 && !noPosts) {
            fetchPosts();
        }
    });

    const groupPostsIntoRows = (posts) => {
        const rows = [];
        for (let i = 0; i < posts.length; i += 5) {
            rows.push(posts.slice(i, i + 5));
        }
        return rows;
    };

    const getRemainingPosts = () => {
        const totalPosts = posts.length;
        const remainingPosts = totalPosts - to;
        const nextTo = remainingPosts > 0 ? to + 100 : totalPosts;
        const prevTo = at === 0 ? 0 : at - 100;

        return { nextTo, prevTo };
    };

    const { nextTo, prevTo } = getRemainingPosts();

    return (
        noPosts ?
        <div id="content">
            <Navbar/>
            <div id="body" className="centered">
                <div className="header">
                    <h1>Uh oh!</h1>
                    <h2>Looks like no results were found.</h2>
                    <Link to='/explore'>Try search for something else</Link>
                </div>
            </div>
            <Footer/>
        </div> : <div id="content">
            <Navbar/>
            <div id="body" className="centered">
                <div id="category" className='truly-centered'>
                    <h1>Here's what we found</h1>
                    <div id='category-controls'>
                        {posts.length > 100 ? <>
                            {at > 0 ? (<Link to={`/results?query=${searchQuery}at=${prevTo}&to=${at}`}>Back</Link>) : <></>}
                            <span>Showing {at + 1} to {to} of {posts.length} post(s)</span>
                            <Link to={`/results?query=${searchQuery}&at=${nextTo}&to=${nextTo + 100}`}>Next</Link>
                        </> : <>
                            <span>Showing {posts.length} of {posts.length} post(s)</span>
                        </>}
                    </div>
                    <div id="post-previews" style={{marginTop: '20px'}}>
                            {groupPostsIntoRows((posts.slice(at, to))).map((row, rowIndex) => (
                                <div id="post-preview-row" key={rowIndex}>
                                    {row.map((post) => (
                                        <Preview key={post.id} data={post} />
                                    ))}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
}