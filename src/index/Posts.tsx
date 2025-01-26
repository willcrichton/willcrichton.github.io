import _ from "lodash";
import React from "react";
import toml from "toml";
import POSTS_RAW from "./posts.toml?raw";

export interface Post {
  abstract: string;
  date: Date;
  title: string;
  url: string;
  venue?: string;
}

function loadPosts() {
  let posts = toml.parse(POSTS_RAW).posts.map((post: any) => ({
    ...post,
    date: new Date(post.date),
  })) as Post[];
  return _.sortBy(posts, post => -post.date);
}

export const POSTS = loadPosts();

export let PostEntry = ({ post }: { post: Post }) => (
  <li>
    <a href={post.url}>{post.title}</a> [
    {post.venue && (
      <>
        {post.venue}
        {", "}
      </>
    )}
    {post.date.getFullYear()}]
  </li>
);
