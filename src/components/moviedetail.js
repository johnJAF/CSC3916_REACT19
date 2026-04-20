import React, { useEffect, useState } from 'react';
import { fetchMovie } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();

  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading);
  const error = useSelector(state => state.movie.error);
  const username = useSelector(state => state.auth.username);

  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        mode: 'cors',
        body: JSON.stringify({
          movieId: movieId,
          reviewerName: username,
          rating: Number(rating),
          review: review
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'failed to submit review');
      }

      setSubmitMessage('review submitted successfully');
      setRating('');
      setReview('');
      dispatch(fetchMovie(movieId));
    } catch (err) {
      setSubmitMessage(err.message);
    }
  };

  if (loading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedMovie) {
    return <div>No movie data available.</div>;
  }

  return (
    <Card className="bg-dark text-dark p-4 rounded">
      <Card.Header>Movie Detail</Card.Header>

      <Card.Body>
        <Image className="image" src={selectedMovie.imageUrl} thumbnail />
      </Card.Body>

      <ListGroup>
        <ListGroupItem>{selectedMovie.title}</ListGroupItem>

        <ListGroupItem>
          <h2>
            <b>{selectedMovie.releaseDate} {selectedMovie.genre}</b>
          </h2>
        </ListGroupItem>

        <ListGroupItem>
          {selectedMovie.actors && selectedMovie.actors.map((actor, i) => (
            <p key={i}>
              <b>{actor.actorName}</b> {actor.characterName}
            </p>
          ))}
        </ListGroupItem>

        <ListGroupItem>
          <h4>
            <BsStarFill /> {selectedMovie.avgRating ?? 0}
          </h4>
        </ListGroupItem>

        <ListGroupItem>
          <h4>reviews</h4>
          {selectedMovie.reviews && selectedMovie.reviews.length > 0 ? (
            selectedMovie.reviews.map((item, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <p><b>{item.reviewerName}</b></p>
                <p><BsStarFill /> {item.rating}</p>
                <p>{item.review}</p>
              </div>
            ))
          ) : (
            <p>no reviews yet</p>
          )}
        </ListGroupItem>

        <ListGroupItem>
          <h4>add a review</h4>
          <Form onSubmit={submitReview}>
            <Form.Group className="mb-3">
              <Form.Label>rating (1-5)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="dark">
              submit review
            </Button>
          </Form>

          {submitMessage && <p style={{ marginTop: '1rem' }}>{submitMessage}</p>}
        </ListGroupItem>
      </ListGroup>
    </Card>
  );
};

export default MovieDetail;