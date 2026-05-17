'use client';

import { useAuth } from "@/hooks/useAuth";
import { createChatWithTutor, isHaveChatWithTutor } from "@/services/chats";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt, FaMoneyBillWave } from "react-icons/fa";

interface TutorPostCardProps {
  post: TutorPost;
}

export default function TutorPostCard({ post }: TutorPostCardProps) {

  const { tutorId } = useAuth();
  const [chat, setChat] = useState<Chat | undefined | null>(undefined);
  const chatRef = useRef<Chat | undefined | null>(null);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  const handleClick = async () => {
    const currentChat = chatRef.current;

    const createChat = async (c: Chat | null) => {
      if (c == null) {
        if (confirm("Вы хотите создать чат с репетитором?")) {
          await createChatWithTutor(post.tutorId);
          window.location.href = "/chats";
        }
      } else {
        window.location.href = "/chats";
      }
    };

    if (currentChat == undefined) {
      const chat = await isHaveChatWithTutor(post.tutorId);
      await createChat(chat);
      return;
    }

    await createChat(currentChat!);
  };

  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star star-filled" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="star star-half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star star-empty" />
        ))}
      </div>
    );
  };

  return (
    <div className="tutor-card">
      <div className="card-header">
        <Link className="tutor-name" href={`/tutor/${post.tutorId}`}>{post.tutorName}</Link>
        {tutorId == null && (
          <button className="btn btn-outline btn-small" onClick={handleClick}>
            Написать
          </button>
        )}
      </div>

      <div className="rating-block">
        {renderStars(post.averageRating || 0)}
        <span className="rating-value">
          {post.averageRating?.toFixed(1) || 'Нет оценок'}
        </span>
        {post.totalReviews !== undefined && post.totalReviews > 0 && (
          <span className="reviews-count">
            ({post.totalReviews} {post.totalReviews === 1 ? 'отзыв' : 'отзывов'})
          </span>
        )}
      </div>

      <div className="tags-container">
        {post.tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag.name}
          </span>
        ))}
      </div>

      <div className="card-description">
        <p>{post.description}</p>
      </div>

      <div className="card-footer">
        <div className="price">
          <FaMoneyBillWave /> {post.hourlyRate} р. / час
        </div>
      </div>
    </div>
  );
}