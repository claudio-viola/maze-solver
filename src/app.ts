const puzzleConfig = require('./config/puzzleConfig.json');
const inquirer = require('inquirer');
const readline = require('readline');

function buildMaze() {
  const puzzle = puzzleConfig.puzzles[0]
  let maze: any = []
  puzzle.layout.forEach(keys => {
    const row = keys.row - 1
    const column = keys.column - 1
    if (!maze[row]) {
      maze[row] = []
    }
    maze[row][column] = keys.borders
  })
  const initialWolfPos = [ puzzle.wolf.row -1,puzzle.wolf.column - 1 ]
  const initialThomasPos = [ puzzle.thomas.row -1,puzzle.thomas.column - 1 ]

  return { maze, initialWolfPos, initialThomasPos }
}



function hasWolfReachedThomas(wolfPos, thomasPos) {
  return wolfPos[0] === thomasPos[0] && wolfPos[1] === thomasPos[1]
}

function hasReachedExit(pos, maze) {
  return maze[pos[0]] === undefined || maze[pos[0]][pos[1]] === undefined
}

function canMoveRight(pos, maze) {
  return !maze[pos[0]][pos[1]].includes('R')
}

function canMoveLeft(pos, maze) {
  return !maze[pos[0]][pos[1]].includes('L')

}

function canMoveUp(pos, maze) {
  return !maze[pos[0]][pos[1]].includes('T')

}

function canMoveDown(pos, maze) {
  return !maze[pos[0]][pos[1]].includes('B')

}

function areOnSameRow(pos1, pos2) {
  return pos1[0] === pos2[0]
}

function areOnSameColumn(pos1, pos2) {
  return pos1[1] === pos2[1]
}

function areOnDifferentRowsAndColumn(pos1, pos2) {
  return pos1[0] !== pos2[0] && pos1[1] !== pos2[1]
}

function moveRight(pos) {
  return [ pos[0], pos[1]+1]
}
function moveLeft(pos) {
  return [ pos[0], pos[1] -1 ]
}
function moveUp(pos) {
  return [ pos[0] - 1, pos[1]]
}
function moveDown(pos) {
  return [ pos[0] + 1, pos[1]]
}
function isLeft(pos1, pos2) {
  return pos1[1] < pos2[1]
}
function isRight(pos1, pos2) {
  return pos1[1] > pos2[1]
}
function isUp(pos1,pos2) {
  return pos1[0] < pos2[0]
}
function isDown(pos1,pos2) {
  return pos1[0] > pos2[0]
}

function shouldMoveVertically(pos1, pos2) {
  return Math.abs(pos1[0] - pos2[0]) > Math.abs(pos1[1] - pos2[1])
}


function moveWolfCloser(pos1, pos2, maze) {
 if (shouldMoveVertically(pos1,pos2)) {
   if (canMoveDown(pos1,maze) || canMoveUp(pos1,maze)) {
    if (isUp(pos1,pos2) && canMoveDown(pos1,maze)) {
      return moveDown(pos1)
    }
    if (isDown(pos1,pos2) && canMoveUp(pos1,maze)) {
      return moveUp(pos1)
    }
  }
  if (canMoveRight(pos1, maze) || canMoveLeft(pos1, maze)) {
    if (isLeft(pos1,pos2) && canMoveRight(pos1, maze)) {
      return moveRight(pos1)
    }
    if (isRight(pos1,pos2) && canMoveLeft(pos1, maze)) {
      return moveLeft(pos1)
    }
  }
 } else {
   if (canMoveRight(pos1, maze) || canMoveLeft(pos1, maze)) {
     if (isLeft(pos1,pos2) && canMoveRight(pos1, maze)) {
       return moveRight(pos1)
     }
     if (isRight(pos1,pos2) && canMoveLeft(pos1, maze)) {
       return moveLeft(pos1)
     }
   }
   if (canMoveDown(pos1,maze) || canMoveUp(pos1,maze)) {
    if (isUp(pos1,pos2) && canMoveDown(pos1,maze)) {
      return moveDown(pos1)
    }
    if (isDown(pos1,pos2) && canMoveUp(pos1,maze)) {
      return moveUp(pos1)
    }
  }
 }
 return pos1
}

function moveWolf(wolfPos, thomasPos, maze) {
  if (areOnSameRow(wolfPos, thomasPos)) {
    if (isLeft(wolfPos,thomasPos) && canMoveRight(wolfPos, maze)) {
      return moveRight(wolfPos)
    }
    if (isRight(wolfPos,thomasPos) && canMoveLeft(wolfPos, maze)) {
      return moveLeft(wolfPos)
    }
    return wolfPos
  }
  else if (areOnSameColumn(wolfPos, thomasPos)) {
    if (isUp(wolfPos, thomasPos) && canMoveDown(wolfPos, maze)) {
      return moveDown(wolfPos)
    }
    if (isDown(wolfPos, thomasPos) && canMoveUp(wolfPos, maze)) {
      return moveUp(wolfPos)
    }
    return wolfPos
  }
  else if (areOnDifferentRowsAndColumn(wolfPos, thomasPos)) {
    return moveWolfCloser(wolfPos, thomasPos, maze)
  }
}

const { maze, initialWolfPos, initialThomasPos } = buildMaze()

let wolfPos = initialWolfPos
let thomasPos = initialThomasPos
let visitedPositions: any = []
let rewardPositions: any = []
let penaltyPosition: any = []

for (var i = 0; i < maze.length; i++) {
    visitedPositions[i] = [];
    rewardPositions[i] = [];
    penaltyPosition[i] = []
    for (var j = 0; j < maze[0].length; j++) {
        visitedPositions[i][j] = 0;
        rewardPositions[i][j] = 0;
        penaltyPosition[i][j] = 0;
        // for (var z = 0; z < maze[0].length; z++) {
        //     visitedPositions[i][j][z] = [];
        //     rewardPositions[i][j][z] = [];
        //     penaltyPosition[i][j][z] = [];
        //     for (var n = 0; n < maze[0].length; n++) {
        //         visitedPositions[i][j][z][n] = 0;
        //         rewardPositions[i][j][z][n] = 0;
        //         penaltyPosition[i][j][z][n] = 0;
        //     }
        // }
    }
}

function hasVisitedPosition(pos) {
  if (hasReachedExit(pos, maze)) {
    return false
  }
  return visitedPositions[pos[0]][pos[1]] === 1
}

function addVisit(pos) {
  visitedPositions[pos[0]][pos[1]] = 0.5
}

/// Build reinforcement learning algorithm,


// @ts-ignore
function automaticSolve() {
  // not finished
  const queue: any = []
  const thomasTurn = true
  queue.push({ thomasPos, wolfPos, thomasTurn })
  while (queue.length !== 0) {
      let { thomasPos, wolfPos, thomasTurn } = queue.shift()
      if (hasReachedExit(thomasPos, maze)) {
        // exit = [thomasPos[0],thomasPos[1]];
        return true;
      }
      if (hasWolfReachedThomas(wolfPos, thomasPos)) {
        penaltyPosition[thomasPos[0]][thomasPos[1]] = penaltyPosition[thomasPos[0]][thomasPos[1]] - 1
        continue;
      }
      addVisit(thomasPos)
      penaltyPosition[thomasPos[0]][thomasPos[1]] = penaltyPosition[thomasPos[0]][thomasPos[1]] + 1
      if (thomasTurn) {
        // don't go prev
        if (canMoveRight(thomasPos, maze) && (!hasVisitedPosition([thomasPos[0],thomasPos[1]+1]))) {
          queue.push({ thomasPos:  moveRight(thomasPos), wolfPos, thomasTurn: false })
        }
        if (canMoveLeft(thomasPos, maze) && (!hasVisitedPosition([thomasPos[0],thomasPos[1]-1]))) {
          queue.push({ thomasPos:  moveLeft(thomasPos), wolfPos, thomasTurn: false })
        }
        if (canMoveUp(thomasPos, maze) && (!hasVisitedPosition([thomasPos[0] - 1,thomasPos[1]]))) {
          queue.push({ thomasPos:  moveUp(thomasPos), wolfPos, thomasTurn: false })
        }
        if (canMoveDown(thomasPos, maze)  && (!hasVisitedPosition([thomasPos[0] + 1,thomasPos[1]]))) {
          queue.push({ thomasPos:  moveDown(thomasPos), wolfPos, thomasTurn: false })
        }
      } else {
        wolfPos = moveWolf(wolfPos, thomasPos, maze)
        if (hasWolfReachedThomas(wolfPos, thomasPos)) {
          penaltyPosition[thomasPos[0]][thomasPos[1]] = penaltyPosition[thomasPos[0]][thomasPos[1]] - 1
          continue;
        }
        wolfPos = moveWolf(wolfPos, thomasPos, maze)
        if (hasWolfReachedThomas(wolfPos, thomasPos)) {
          penaltyPosition[thomasPos[0]][thomasPos[1]] = penaltyPosition[thomasPos[0]][thomasPos[1]] - 1
          continue;
        }
        penaltyPosition[thomasPos[0]][thomasPos[1]] = penaltyPosition[thomasPos[0]][thomasPos[1]] + 1

        queue.push({ thomasPos, wolfPos, thomasTurn: true })
      }
  }
}

const MOVE_RIGHT_KEY = 'RIGHT'
const MOVE_LEFT_KEY= 'LEFT'
const MOVE_UP_KEY = 'UP'
const MOVE_DOWN_KEY = 'DOWN'
const MOVE_FORFAIT_KEY = 'S'
const QUIT_GAME_KEY = 'Q'
const EXIT_GAME_KEY = 'E'

function listPossibleMoves(pos, maze): string[] {
  let moves: any = []
  if (canMoveRight(pos, maze)) {
    moves.push(MOVE_RIGHT_KEY)
  }
  if (canMoveLeft(thomasPos, maze)) {
    moves.push(MOVE_LEFT_KEY)
  }
  if (canMoveUp(thomasPos, maze)) {
    moves.push(MOVE_UP_KEY)
  }
  if (canMoveDown(thomasPos, maze)) {
    moves.push(MOVE_DOWN_KEY)
  }
  moves.push(MOVE_FORFAIT_KEY)
  return moves
}


function moveThomas(thomasPos, move) {
  if (move === MOVE_RIGHT_KEY) {
    console.log('Thomas moves right one')
    return moveRight(thomasPos)
  }
  if (move === MOVE_LEFT_KEY) {
    console.log('Thomas moves left one')
    return moveLeft(thomasPos)
  }
  if (move === MOVE_UP_KEY) {
    console.log('Thomas moves up one')
    return moveUp(thomasPos)
  }
  if (move === MOVE_DOWN_KEY) {
    console.log('Thomas moves down one')
    return moveDown(thomasPos)
  }
  if (move === MOVE_FORFAIT_KEY) {
    console.log('Thomas forfeits turn')
    return thomasPos
  }
}
async function keypress(): Promise<string> {
  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('keypress', (str, key) => {
    process.stdin.setRawMode(false)
    resolve(key.name)
  }))
}

function printMaze(maze, thomasPos, wolfPos) {
  var str
  for (var i=0; i<maze.length; i++) {
    str = ''
      for (var j=0; j< maze[i].length; j++) {
        if (maze[i][j].includes('L')  && ((maze[i][j - 1] === undefined) || !maze[i][j - 1].includes('R'))) {
          str = str.concat(`|${i+1}${j+1}`)
        }
        if (maze[i][j].includes('T')) {
          str = str.concat('⎻')
        }
        if (maze[i][j].includes('R')) {
          str = str.concat('|')
        }
        else {
          str = str.concat(' ')
        }

    }
    console.log(str)
  }
}
async function interactiveSolve() {
  while (!hasReachedExit(thomasPos, maze) || hasWolfReachedThomas(wolfPos, thomasPos)) {
    // printMaze(maze, thomasPos, wolfPos)
    console.log(`Thomas Position is ${thomasPos[0]+1}${thomasPos[1]+1}`)
    console.log(`Wolf Position is  ${wolfPos[0]+1}${wolfPos[1]+1}`)
    let available_moves: string[] = listPossibleMoves(thomasPos, maze)
    console.log('\n!!!Available Moves!!!', available_moves.join(' '));

    let move = await keypress();
    move = move.toUpperCase()
    console.log('move', move)
    if (move === QUIT_GAME_KEY) {
      console.log('\n*********RESTARTING GAME*********\n')
      wolfPos = initialWolfPos
      thomasPos = initialThomasPos
      continue;
    }
    if (move === EXIT_GAME_KEY) {
      console.log('Exiting')
      process.exit(0)
      // return;
    }
    if (available_moves.includes(move)) {
      thomasPos = moveThomas(thomasPos, move)
    }
    else {
      console.log('\n*******Invalid move, try again*******\n')
      continue;
    }
    if (hasReachedExit(thomasPos, maze)) {
      console.log('Congratulations Thomas has reached the exit safely!')
      return true;
    }

    if (hasWolfReachedThomas(wolfPos, thomasPos)) {
      console.log('\n*******Ouch! The wolf caught Thomas!!! Try again from the beginning\n')
      console.log('\n *******New Game Begins')
      wolfPos = initialWolfPos
      thomasPos = initialThomasPos
      continue;

    }
    console.log('\nIt`s the wolf turn\n')
    wolfPos = moveWolf(wolfPos, thomasPos, maze)
    if (hasWolfReachedThomas(wolfPos, thomasPos)) {
      console.log('\n*******Ouch! The wolf caught Thomas!!! Try again from the beginning\n')
      console.log('\n *******New Game Begins')

      wolfPos = initialWolfPos
      thomasPos = initialThomasPos
      continue;
    }
    wolfPos = moveWolf(wolfPos, thomasPos, maze)
    if (hasWolfReachedThomas(wolfPos, thomasPos)) {
      console.log('\n*******Ouch! The wolf caught Thomas!!! Try again from the beginning\n')
      console.log('\n *******New Game Begins')

      wolfPos = initialWolfPos
      thomasPos = initialThomasPos
      continue;

    }
  }
}


console.log('Welcome to the Maze')
console.log(`To move hit one of the keys available`)
console.log('(Right Key) to move Right')
console.log('(Left Key) to move Left')
console.log('(Up Key) to move Up')
console.log('(Down Key) to move Down')
console.log('(S) to forfait turn')

// , \nLeft key to move Left, Up key to move Up, Down key to move down, S to forfeit turn`)
console.log('(Q) to restart the game ')
console.log('(E) to exit the game ')
// console.log('\n Game Begins')

interactiveSolve()
