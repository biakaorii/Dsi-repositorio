// contexts/ReviewsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfilePhotoUrl?: string;
  userProfileType?: 'leitor' | 'empreendedor' | 'critico';
  businessName?: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookImage?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  likedBy: string[];
}

interface ReviewsContextData {
  reviews: Review[];
  loading: boolean;
  createReview: (
    bookId: string,
    bookTitle: string,
    bookAuthor: string,
    bookImage: string,
    rating: number,
    comment: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateReview: (
    reviewId: string,
    rating: number,
    comment: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;
  getReviewsByBook: (bookId: string) => Review[];
  getReviewsByUser: (userId: string) => Review[];
  getUserReview: (bookId: string, userId: string) => Review | undefined;
  likeReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;
  unlikeReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;
}

const ReviewsContext = createContext<ReviewsContextData>({} as ReviewsContextData);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Listener em tempo real para reviews
  useEffect(() => {
    // Só inicia o listener se houver usuário autenticado
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData: Review[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          reviewsData.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userProfilePhotoUrl: data.userProfilePhotoUrl,
            userProfileType: data.userProfileType,
            businessName: data.businessName,
            bookId: data.bookId,
            bookTitle: data.bookTitle,
            bookAuthor: data.bookAuthor,
            bookImage: data.bookImage,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            likes: data.likes || 0,
            likedBy: data.likedBy || [],
          });
        });
        setReviews(reviewsData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar reviews:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Criar review
  async function createReview(
    bookId: string,
    bookTitle: string,
    bookAuthor: string,
    bookImage: string,
    rating: number,
    comment: string
  ) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se usuário já fez review deste livro
      const existingReview = reviews.find(
        (r) => r.bookId === bookId && r.userId === user.uid
      );

      if (existingReview) {
        return { success: false, error: 'Você já avaliou este livro' };
      }

      const reviewData = {
        userId: user.uid,
        userName: user.name,
        userProfilePhotoUrl: user.profilePhotoUrl || '',
        userProfileType: user.profileType,
        businessName: user.businessName || '',
        bookId,
        bookTitle,
        bookAuthor,
        bookImage,
        rating,
        comment,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao criar review:', error);
      return { success: false, error: 'Erro ao criar review' };
    }
  }

  // Atualizar review
  async function updateReview(reviewId: string, rating: number, comment: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const review = reviews.find((r) => r.id === reviewId);

      if (!review) {
        return { success: false, error: 'Review não encontrado' };
      }

      if (review.userId !== user.uid) {
        return { success: false, error: 'Você não pode editar este review' };
      }

      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        rating,
        comment,
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar review:', error);
      return { success: false, error: 'Erro ao atualizar review' };
    }
  }

  // Deletar review
  async function deleteReview(reviewId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const review = reviews.find((r) => r.id === reviewId);

      if (!review) {
        return { success: false, error: 'Review não encontrado' };
      }

      if (review.userId !== user.uid) {
        return { success: false, error: 'Você não pode deletar este review' };
      }

      await deleteDoc(doc(db, 'reviews', reviewId));
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar review:', error);
      return { success: false, error: 'Erro ao deletar review' };
    }
  }

  // Buscar reviews por livro
  function getReviewsByBook(bookId: string): Review[] {
    return reviews
      .filter((r) => r.bookId === bookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Buscar reviews por usuário
  function getReviewsByUser(userId: string): Review[] {
    return reviews
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Buscar review específico do usuário para um livro
  function getUserReview(bookId: string, userId: string): Review | undefined {
    return reviews.find((r) => r.bookId === bookId && r.userId === userId);
  }

  // Curtir review
  async function likeReview(reviewId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const review = reviews.find((r) => r.id === reviewId);

      if (!review) {
        return { success: false, error: 'Review não encontrado' };
      }

      if (review.likedBy.includes(user.uid)) {
        return { success: false, error: 'Você já curtiu este review' };
      }

      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao curtir review:', error);
      return { success: false, error: 'Erro ao curtir review' };
    }
  }

  // Descurtir review
  async function unlikeReview(reviewId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const review = reviews.find((r) => r.id === reviewId);

      if (!review) {
        return { success: false, error: 'Review não encontrado' };
      }

      if (!review.likedBy.includes(user.uid)) {
        return { success: false, error: 'Você não curtiu este review' };
      }

      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao descurtir review:', error);
      return { success: false, error: 'Erro ao descurtir review' };
    }
  }

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loading,
        createReview,
        updateReview,
        deleteReview,
        getReviewsByBook,
        getReviewsByUser,
        getUserReview,
        likeReview,
        unlikeReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews deve ser usado dentro de ReviewsProvider');
  }
  return context;
}