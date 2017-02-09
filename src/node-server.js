import React from 'react';
import ReactDOM from 'react-dom/server';
import express from 'express';
import configureStore from 'reducers/site';
import { match, RouterContext } from 'react-router';
import { setUserIp } from 'actions/user_ip';
import { setSession } from 'actions/session';
import {
  areScriptsEnabled,
  getUserIp,
  getUserSession,
  loadUserData,
} from 'utils/server';

const server = express();
server.disable('x-powered-by');

/**
 *  Process requests
 */
server.use((req, res) => {
  const store = configureStore();
  const scripts_enabled = areScriptsEnabled(req.headers);
  const user_ip = getUserIp(req.headers);
  const user_session = getUserSession(req.headers);

  store.dispatch(setUserIp(user_ip));
  store.dispatch(setSession(user_session));

  console.log(`[${user_ip}, ${scripts_enabled}] new request`);

  const user_promise = loadUserData(user_session, user_ip);

  Promise.all(user_promise)
  .then((user_info) => {
    console.log(user_info);
    res.status(200).end('it works!');
  })
  .catch((err) => {
    console.log(err);
    res.status(500).end('Internal server error');
  });
});

/* global NODE_PORT */
server.listen(NODE_PORT, () => {
  console.log(`Server listening on: ${NODE_PORT}`);
});
