import axios from "axios";
import React, {FunctionComponent, useState, useEffect} from "react";
import { CommentSection } from "../components/comments/CommentSection";
import { CreateOrEditPost } from "../components/posts/CreateOrEditPost";


export const Posts:FunctionComponent = () => {


    interface PostInterface {
        postId: string;
        title: string;
        details: string;
        updatedAt: string;
        displayEditModal: boolean;
        showComments: boolean;
    }

    
    const [posts, setPosts] = useState<PostInterface[]>([]);
    const [displayCreateModal, setDisplayCreateModal] = useState<boolean>(false);
    const [fetchPosts, setFetchPosts] = useState<boolean>(true);

    useEffect(() => {
        if(fetchPosts === false) return;

        axios.get('/api/user/posts')
        .then(res => {
            const { userPosts } = res.data;
            setPosts(userPosts);
            
        })
        .catch(e => {

            const error = e.response.data;
            console.log(e);
            console.log(error)
            setPosts([]);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    // alert(`${error.message}. CODE: ${error.code}`);
            }
        })

        setFetchPosts(false);
    },[fetchPosts])


    const deletePost = (postId: string) => {
        console.log("Sending delete req for post: " + postId);
        axios.delete(`/api/user/posts/${postId}`)
        .then(res => {
            setFetchPosts(true);
        })
        .catch(e => {

            const error = e.response.data;
            console.log(e);
            console.log(error)
            setFetchPosts(true);
            switch(e.response.status){
                case 401:
                    console.log("error 401")
                    break;
                default:
                    alert(`${error.message}. CODE: ${error.code}`);
            }
        })
    }

    return ( 
        <div className="posts">
            
            <h1>Posts:</h1>
            <button type="button" onClick={ () => {
                setDisplayCreateModal(prevDisplayCreateModal => !prevDisplayCreateModal);
            }}>
                {displayCreateModal ? "Hide" : "Create" }
            </button>
            {displayCreateModal && <CreateOrEditPost 
                setFetch={setFetchPosts}
                editMode={false}
            />}
            <hr></hr>
            <br/><br/><br/>
            {posts.length > 0 && 
            posts.map(post => {
                return (<div key={post.postId}>
                    <div>PostID: {post.postId}</div>
                    <div>Title: {post.title}</div>
                    <div>Details: {post.details}</div>
                    <div>Updated last: {post.updatedAt}</div>
                    <button type="button" onClick={ () => {setPosts(prevPosts => {
                        return prevPosts.map(currPost => {
                            if(currPost.postId === post.postId){
                                return{
                                    ...currPost,
                                    displayEditModal: !currPost.displayEditModal
                                }
                            }else{
                                return currPost
                            }
                        })
                    })}}>
                        {post.displayEditModal ? "Hide" : "Edit" }
                    </button>
                    <button type="button" onClick={() => deletePost(post.postId)}>
                        Delete
                    </button>
                    {post.displayEditModal && <CreateOrEditPost 
                        postId={post.postId} 
                        title={post.title}
                        details={post.details}
                        updatedAt={post.updatedAt}
                        setFetch={setFetchPosts}
                        editMode={true}
                    />}
                    <button type="button" onClick={ () => {setPosts(prevPosts => {
                        return prevPosts.map(currPost => {
                            if(currPost.postId === post.postId){
                                return{
                                    ...currPost,
                                    showComments: !currPost.showComments
                                }
                            }else{
                                return currPost
                            }
                        })
                    })}}>
                        {post.showComments ? "Hide Comments" : "Show Comments" }
                    </button>
                    {post.showComments && 
                    <div>
                        <CommentSection
                            postId={post.postId}
                            showComments={post.showComments}
                            />
                    </div>
                    }
                    <hr></hr>
                    <br/><br/><br/>
                </div>)
            })}
        </div>
        
    )
}