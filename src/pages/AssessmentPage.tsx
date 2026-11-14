import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const AssessmentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/tools/${slug}` : '/'} replace />;
};
