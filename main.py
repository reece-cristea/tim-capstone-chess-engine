import chess

if __name__ == "__main__":
    mainBoard = chess.Board()
    playing = True
    while(playing):
        print(mainBoard)

        if mainBoard.is_checkmate():
            playing = False
            if mainBoard.turn == False:
                print("White has checkmate! Good game!")
            if mainBoard.turn == True:
                print("Black has checkmate! Good game!")
            continue

        moveFrom = ""
        moveTo = ""
        if mainBoard.turn == True:
           print("White's turn")
           moveFrom = input("Move From: ")
           moveTo = input("Move To: ")
        else:
           print("Black's turn")
           moveFrom = input("Move From: ")
           moveTo = input("Move To: ")
        
        move = chess.Move.from_uci(moveFrom + moveTo)

        while move not in mainBoard.legal_moves:
            print("Not a legal move. Please enter a legal move.")
            moveFrom = input("Move From: ")
            moveTo = input("Move To: ")
            move = chess.Move.from_uci(moveFrom + moveTo)
            

        mainBoard.push(move)
        print("-----------------")