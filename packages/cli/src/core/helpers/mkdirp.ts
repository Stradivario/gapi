import { mkdir, mkdirSync, stat, statSync } from 'fs';
import { dirname, resolve } from 'path';
const _0777 = parseInt('0777', 8);

export function mkdirp(p?, opts?, f?, made?) {
  if (typeof opts === 'function') {
    f = opts;
    opts = {};
  } else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  let mode = opts.mode;

  if (mode === undefined) {
    mode = _0777 & ~process.umask();
  }
  if (!made) made = null;

  const cb =
    f ||
    function () {
      //
    };
  p = resolve(p);

  mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
      case 'ENOENT':
        mkdirp(dirname(p), opts, function (er, made) {
          if (er) cb(er, made);
          else mkdirp(p, opts, cb, made);
        });
        break;

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        stat(p, function (er2, stat) {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) cb(er, made);
          else cb(null, made);
        });
        break;
    }
  });
}

export function mkdirpSync(p?, opts?, made?) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  let mode = opts.mode;

  if (mode === undefined) {
    mode = _0777 & ~process.umask();
  }
  if (!made) made = null;

  p = resolve(p);

  try {
    mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    switch (err0.code) {
      case 'ENOENT':
        made = mkdirpSync(dirname(p), opts, made);
        mkdirpSync(p, opts, made);
        break;

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        let stat;
        try {
          stat = statSync(p);
        } catch (err1) {
          throw err0;
        }
        if (!stat.isDirectory()) throw err0;
        break;
    }
  }

  return made;
}
